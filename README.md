# Introduction

This cast player was built upon the sample version of the Custom Receiver Sample Player by Google. The receiver options provided by Google are
"Default", "Styled Media Receiver" and the "Custom Receiver". The first one is a simple default version, the second one
provides the opportunity to modify some CSS: the background image, the color of the progress bar and the logo. The custom receiver
allows the full edition of the code regarding Chromecast API to properly load the .js, .css and .html files for the chromecast device usage.<br>

<h5> Directory Tree </h5>
```
-Analytics
------css
------fonts
------js
------index.html
-Receiver
------css
------js
------player.html
-streaming
------streaming.html
-server.js
-README.MD
-firebase.MD
```
<h5> Documentation files </h5>
<b>Server</b> <br>
NODE.js server to implement the application itself and POST requests. Full explanation is given below in this file.<br>
<b>Receiver App</b> <br>
The full structure is explained [here](./Receiver/README.md), but a simple and general explanation is given in this file. <br>
<b>Streaming</b> <br>
Contains the JSON-style database with all the information from each video. The full structure is explained [here](./Streaming/README.md).
<br>
<b>Analytics </b> <br>
Contains a sample web implementation of statistical visualization for each seen video. The full structure is explained [here](./Analytics/README.md).<br>
<b>Firebase </b> <br>
The Firebase data storage is explained [here](./firebase.md).
<br>
<b>Extra </b><br>
Simple server version without POST requests for analytics/streaming [here](./extra/simple-server.js) <br>
Sample Sender for DRM testing. Built upon the Google sample, but the functionalities between sender-receiver were changed to meet some other testing criteria and proof-of-concepts<br>
Sample sender for normal testing. This is the sample from Google for simple testing without any changes.<br>


# Chromecast - Setup

* Get the Chromecast device
* Upload the project to a website that can be accessed from Chromecast. When the application is published, it will need to host so that it is accessible using HTTPS.
* Register the application on the Developers Console (http://cast.google.com/publish). Enter the URL for the player.html or whichever is the name of the html that will be used by the device. 
* The serial # of the Chromecast device needs to be registered in the developer console as well.
* 15 minutes after you have updated the developers console, you should reboot your Chromecast, so that it picks up the changes.
* Enter the App ID of your receiver application into your sender application or one of our sample sender applications, such as DemoCastPlayer.
* You should now be able to launch your receiver using a sender.
* Until the app is not published, the system lets you restrict the receiver to devices that you specify and allows you to host on most development servers.

# Server setup and the Chromecast Debugger
First of all, it's necessary to set the server to start running the project, based on another googlecast project: custom-receiver. <br>
It is a express-node.js server. It has implemented a CORS application that allows the information to be sent Cross-Domain. <br>
Extra parts -> Analytics and Streaming: The server also has a POST request definition, used for saving data used by the Analytics/Streaming part. Therefore, it's necessary to also install some modules other than just express. It was constructed to simulate a possible use for the information sent by the Cast Player after a session.<br>

<h5>If there is no interest in the Streaming Analytics Part, there is a simple server version [here](./extra/simple-server.js).</h5><br>

- Install Node.js (https://nodejs.org/)
- Clone this project with github
- Go to the cloned folder with the command line
```
- $npm install express
- $npm install querystring
- $npm install body-parser
- $node server.js
```

<h5>About the server</h5> The server uses the express framework to provide a  node.js server. It implements Cross-origin resource sharing (CORS), which allows truly open access across domain-boundaries. <br>
<h5>Debugger</h5>After the server is setup and the application is registered, it's possible to use the chromecast debugger. Start a sender device that directs to your new application ID, connect to chromecast. Then, open your browser and try &lt;IP of your Chromecast>:9222 . It will display a web page and if you click in the provided link, you will be redirected to the console page. The console page might be blank, so it's necessary to click in the upper-right shield near the link of the page and select "load unsafe scripts" to see the debug messages. Also, it might be necessary to type the command:
```
cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG).
```
If it doesn't work, there might be a problem with the sender application (incorrect application ID), the server could not be accessible/online or some similar situation. Try to reboot the server and the chromecast. Changes on the developers console might take around 15 minutes to reload, although it's usually almost simultaneous. The streaming app could also be used for debugging and will be further explained<br><br>


# Server - POST requests

This simulates the use of the information sent by ajax for a server. For simplicity and to exemplify the general idea, this is all implemented in one unique server. When the server receives a POST request, it handles the acquired data and saves it in two different ways (streaming/analytics) in a Firebase database. For instance, the data for the analytics part looks like this:

```json
{
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4": {
    "title": "For Bigger Escape",
    "duration": 15.046531,
    "secondsSeen": "1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/0",
    "secondsPaused": "0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/1",
    "secondsRestart": "1/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0",
    "secondsVolumeChanged": "0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0",
    "Views": 1,
    "AvgPercentageWatched": 0.9375,
    "MilestonePercentagePerSession": [0, 0, 0, 0, 1],
    "viewsYear": {"2015": [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]}
  }
}
```
It is structured as a "dictionary" or an associative array in Javascript language. Each primary key is the unique contentId of each video. The value of each of these keys is another associative array object that contains all the current data for a lot of different attributes of the video. It is written in a way to easily get the data afterwards and to save space. The full explanation of each one of the attributes is explained [here](./firebase.md).

The structure of the POST is set to receive very specific data structure, anything different from that would be not uploaded in the updated json file created. The POST uses -bodyparser- to get the JSONIFIED string and use it as an object. Then it uses some logical components to add the values to each attribute correctly. In the end, it saves the new data in the database using the Set method.

# Upgrades and possible problems

The idea of the whole project is to create the possibility of a full implemented custom receiver that could be easily changed and styled, save data from the user and also a separate part of the application to show how this data could be used by the content provider.

The main logic: <br>
1. Server implements the online website that will provide information for the device. => Exemplifies the online application<br>
2. Receiver implements the custom receiver, supporting DRM, queues, saving data, all the listened events and easy to change styles. => Exemplifies the full implemented custom app<br>
3. Server and Firebase implements the data storage. => Exemplifies the way to get and store data from the custom app<br>
4. Analytics/Streaming implements the statistical visualization of the data. => Exemplifies the way to use the acquired data to visualize the statistical information.<br>

There are still a lot of possible improvements for the Server/Database(3) part related to security and efficiency of the Analytics/Streaming (4). The whole implementation server->database->streaming/analytics here provided is not yet supposed to be a ready-for-production App, but skeleton for a future fully designed Application. 

# General Receiver Explanation
<b>Receiver Folder (The New Custom Receiver): </b> <br>
<i>CSS/HTML</i><br> Provides the general design styling for the App. The loading, launching, paused, next-video, queue pages are presented here. 

<i>JAVASCRIPT</i><br> The javascript is essential to present the design animations, DRM capabilities, queueing and to save data from the user session for all the different events listened while casting. Therefore, the new version is capable of getting the information from each event and sending it via AJAX calls to an external server and then use the data for any particular matter. The data is divided into Cast Sessions and is particular for each video watched. The data is sent externally via two different ways: <i>Constant Update</i> and <i>Session Data</i>. The constant update is sent to a chosen server every time a different event occur (milestones for parts of the video watched for example). The Sessiopn Data is also sent to a chosen server in the end of each casting. The chromecast runs a simple html, powered with javascript and css. As it is fairly easy to get the speed of the application decreased, the best way to deal with the data is to sent it externally via an Asynchronous Call (AJAX). <br>



