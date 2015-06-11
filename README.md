# Introduction

This cast player was built upon the sample version of the Custom Receiver Sample Player by Google. The vesions provided by Google are 
"Default", "Styled Media Receiver" and the "Custom Receiver". The first one is a simple default version as said, the second one
provides the opportunity to modify some CSS: the background image, the color of the progress bar and the logo. The custom receiver
allows the full edition of the code regarding Chromecast API to properly load the .js, .css and .html file for the chromecast device.

# Server and Setup
First of all, it's necessary to set the server to start running the project, based on another googlecast project: custom-receiver. It is a simple node.js server. It is also implemented a simple CORS application that allows the information to be sent Cross-Domain.
- Install Node.js (https://nodejs.org/)
- Clone this project with github
- Go to the cloned folder with the command line
- $npm install express.js
- $npm install express.js
- $npm install express.js

# General Structure Explanation
<b>The New Custom Receiver: </b> <br>
<i>CSS/HTML</i>: The new version has a similar User Interface in the html/css part (some differences on the play/pause bar)  
and is capable of easily change some styling (such as the Styled Media Receiver), just changing some external simple code. 

<i>JAVASCRIPT</i>: The real necessity for the new Custom Receiver is acquiring data from all the different events listened while casting. Therefore, the new version is capable of getting the information from each event and sending it via AJAX call to an external server and then use the data for any particular matter. The events listened: Device Connected/Video Pause/Video Start-Restart/Volume Changed/Seconds Seen/Device Disconnected. The data is divided into Cast Sessions and is particular for each video watched. The data is sent externally via two different ways: <i>Constant Update</i> and <i>Full Data</i>. The constant update is sent to a chosen server every time a different event occur (including milestones for parts of the video watched). The Full Data is also sent to a chosen server in the end of the Cast Session. The chromecast runs a simple html, powered with javascript and css (easy to have the speed decreased), that's why the best way to deal with the data is to sent it externally with an Asynchronous Call (AJAX). 

<b>Server - POST requests: </b> <br>
<b>Log: </b> <br>
<b>Analytics: </b> <br>

