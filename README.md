# Introduction

This cast player was built upon the sample version of the Custom Receiver Sample Player by Google. The vesions provided by Google are 
"Default", "Styled Media Receiver" and the "Custom Receiver". The first one is a simple default version as said, the second one
provides the opportunity to modify some CSS: the background image, the color of the progress bar and the logo. The custom receiver
allows the full edition of the code regarding Chromecast API to properly load the .js, .css and .html file for the chromecast device.

# Chromecast - Setup

- Get the Chromecast device
- Upload the project to a website that can be accessed from Chromecast. When the application is published, it will need to host so that it is accessible using HTTPS.
- Register the application on the Developers Console (http://cast.google.com/publish). Enter the URL for the player.html or whichever is the name of the html that will be used by the device. 
- The serial # of the Chromecast device needs to be registered in the developer console as well.
- 15 minutes after you have updated the developers console, you should reboot your Chromecast, so that it picks up the changes.
- Enter the App ID of your receiver application into your sender application or one of our sample sender applications, such as DemoCastPlayer.
- You should now be able to launch your receiver using a sender.
- Until the app is not published, the system lets you restrict the receiver to devices that you specify and allows you to host on most development servers.

# Server setup and the Chromecast Debugger
First of all, it's necessary to set the server to start running the project, based on another googlecast project: custom-receiver. <br>
It is a simple node.js server. It has implemented a simple CORS application that allows the information to be sent Cross-Domain. <br>
Extra part -> Analytics and log: The server also has a POST request definition, used for saving data used by the Analytics part. Therefore, it's necessary to also install some modules other than just express. It was constructed to simulate a possible use for the information sent by the Cast Player after a session.<br>
If the Analytics/log is not needed, the part of the code that requires that and the POST request definition method can be deleted and there won't be no need for the last installations below (body-parser, querystring and json-stringify-pretty-compact.

- Install Node.js (https://nodejs.org/)
- Clone this project with github
- Go to the cloned folder with the command line
- $npm install express
- $npm install querystring
- $npm install body-parser
- $npm install json-stringify-pretty-compact
- $node server.js

After the server is setup and the application is registered, it's possible to use the chromecast debugger. Using a sender device that directs to your new application ID, connect to chromecast. Then, open your browser and try &lt;IP of your Chromecast>:9222 . If it doesn't work, there might be a problem with the sender application (incorrect application ID), the server could not be accessible/online or some similar situation. Try to reboot the server and the chromecast. Changes on the developers console might take around 15 minutes to reload, although it's usually almost simultaneous.

# Server - POST requests

This simulates the use of the information sent by ajax for a server. For simplicity and to exemplify the general idea, this is all implemented in one unique server. When the server receives a POST request, it handles the acquired data and saves it in a JSON file like this:

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
It is structured as a "dictionary" or an associative array in Javascript language. Each primary key is the unique contentId of each video. The value of each of these keys is another associative array object that contains all the current data for a lot of different attributes of the video. It is written in a way to easily get the data afterwards and to save space. The full explanation of each one of the attributes is explained here: https://github.com/BrightcoveConsultingReusableComponents/Cast-Player-Sample/blob/BCO-js/log/README.md

The structure of the POST is set to receive very specific data structure, anything different from that would be not uploaded in the updated json file created. The POST uses -bodyparser- to get the JSONIFIED string and use it as an object. Then it uses some logical components to add the values to each attribute correctly. In the end, it saves the data on the log folder, using json-stringify-pretty-compact to save in a readable version of json (it could be changed to JSON.stringify to save in a minimal-not-readable json file).

# Upgrades and possible problems

The idea of the whole project is to create the possibility of a full implemented custom receiver that could be easily changed and styled, save data from the user and also to show how this data could be used by the content provider.

The main logic: <br>
1. Server implements the online website that will provide information for the device. => Exemplifies the online application
2. Receiver implements the custom receiver, supporting DRM, saving data, all the listened events and easy to change styles. => Exemplifies the full implemented custom app
3. Server and log implements the data storage. => Exemplifies the way to get and store data from the custom app
4. Analytics implements the statistical visualization of the data. => Exemplifies the way to use the acquired data to visualize the statistical information.

The main problem with the whole structure is the number 3. The third part is not as applicable as the other ones, the server is very simple and the logic to store data is too risky. There could be POST attacks or corrupted files. Although there is some prevention, the system should change for some other platform such as MONGODB to save JSON more properly. <br>

The first, second and fourth part could be used for production level. Only a few changes on the structure to serve the specific app that it would work with on and some testing patterns to guarantee that it works in different situations must be sufficient. 

# General Structure Explanation
<b>Receiver Folder (The New Custom Receiver): </b> <br>
<i>CSS/HTML</i><br> The new version has a similar User Interface in the html/css part (some differences on the play/pause bar)  
and is capable of easily change some styling (such as the Styled Media Receiver), just changing some external simple code. 

<i>JAVASCRIPT</i><br> The real necessity for the new Custom Receiver is acquiring data from all the different events listened while casting. Therefore, the new version is capable of getting the information from each event and sending it via AJAX call to an external server and then use the data for any particular matter. The events listened: Device Connected/Video Pause/Video Start-Restart/Volume Changed/Seconds Seen/Device Disconnected. The data is divided into Cast Sessions and is particular for each video watched. The data is sent externally via two different ways: <i>Constant Update</i> and <i>Full Data</i>. The constant update is sent to a chosen server every time a different event occur (including milestones for parts of the video watched). The Full Data is also sent to a chosen server in the end of the Cast Session. The chromecast runs a simple html, powered with javascript and css (easy to have the speed decreased), that's why the best way to deal with the data is to sent it externally with an Asynchronous Call (AJAX). 

<b>Server.js</b> <br>
NODE.js server to implement the application itself and POST requests. Full explanation is given above.<br>
<b>Log Folder: </b> <br>
Contains the JSON file with all the information from each video. The full structure is explained here: https://github.com/BrightcoveConsultingReusableComponents/Cast-Player-Sample/blob/BCO-js/log/README.md
<br>
<b>Analytics: </b> <br>
Contains a full web implementation of statistical visualization for the data from each video. The full structure is explained here: https://github.com/BrightcoveConsultingReusableComponents/Cast-Player-Sample/blob/BCO-js/Analytics/README.md
