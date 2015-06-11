# Introduction

This cast player was built upon the sample version of the Custom Receiver Sample Player by Google. The vesions provided by Google are 
"Default", "Styled Media Receiver" and the "Custom Receiver". The first one is a simple default version as said, the second one
provides the opportunity to modify some CSS: the background image, the color of the progress bar and the logo. The custom receiver
allows the full edition of the code regarding Chromecast API to properly load the .js, .css and .html file for the chromecast device.

# Server - Setup
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
It is structured as a "dictionary" or an associative array in Javascript language. Each primary key is the unique contentId of each video. The value of each of these keys is another associative array object that contains all the current data for a lot of different attributes of the video. It is written in a way to easily get the data afterwards and to save space. The full explanation of each one of the attributes is explained here: 

# Upgrades and possible problems

# General Structure Explanation
<b>The New Custom Receiver: </b> <br>
<i>CSS/HTML</i>: The new version has a similar User Interface in the html/css part (some differences on the play/pause bar)  
and is capable of easily change some styling (such as the Styled Media Receiver), just changing some external simple code. 

<i>JAVASCRIPT</i>: The real necessity for the new Custom Receiver is acquiring data from all the different events listened while casting. Therefore, the new version is capable of getting the information from each event and sending it via AJAX call to an external server and then use the data for any particular matter. The events listened: Device Connected/Video Pause/Video Start-Restart/Volume Changed/Seconds Seen/Device Disconnected. The data is divided into Cast Sessions and is particular for each video watched. The data is sent externally via two different ways: <i>Constant Update</i> and <i>Full Data</i>. The constant update is sent to a chosen server every time a different event occur (including milestones for parts of the video watched). The Full Data is also sent to a chosen server in the end of the Cast Session. The chromecast runs a simple html, powered with javascript and css (easy to have the speed decreased), that's why the best way to deal with the data is to sent it externally with an Asynchronous Call (AJAX). 

<b>Server - POST requests: </b> <br>
<b>Log: </b> <br>
<b>Analytics: </b> <br>

