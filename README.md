# Introduction

This cast player was built upon the sample version of the Custom Receiver Sample Player by Google. The vesions provided by Google are 
"Default", "Styled Media Receiver" and the "Custom Receiver". The first one is a simple default version as said, the second one
provides the opportunity to modify some CSS: the background image, the color of the progress bar and the logo. The custom receiver
allows the full edition of the code regarding Chromecast API to properly load the .js, .css and .html file for the chromecast device.

# General Explanation
<b>The New Custom Receiver: </b> <br>
<i>CSS/HTML</i>: The new version has a similar User Interface in the html/css part (some differences on the play/pause bar)  
and is capable of easily change some styling (such as the Styled Media Receiver), just changing some external simple code. 

<i>JAVASCRIPT</i>: The real necessity for the new Custom Receiver is acquiring data from all the different events listened while casting. Therefore, the new version is capable of getting the information from each event and sending it via AJAX call to an external server and then use the data for any particular matter. The events listened: Device Connected/Video Pause/Video Start-Restart/Volume Changed/Seconds Seen/Device Disconnected. The data is divided into Cast Sessions and is particular for each video watched. The data is sent externally via two different ways.
