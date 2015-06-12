# Custom Receiver Application - Player.html and Intro
As explained in the main folder README, the idea of the custom receiver is to allow easy ways to edit, store information and display other kind of content such as DRM-based ones. The chromecast device loads a simple html file (that must be simple, otherwise it would cause efficiency problems). This html file uses Javascript and CSS to provide the media structure and style, using the cast API.
# Structure

Directory Tree
-player.html<br>
-css<br>
----- player.css<br>
----- assets/<br>
-js<br>
----- player.js<br>
----- styles.js

Player.html is the html loaded. Player.js coordinates the use of the API. Player.css coordinates the styling, and styles.js makes it easy to change the css if necessary without the need to go to the actual player.js code. Assets folder contains the images loaded.

# Player.js
<h5> WARNING: The parts of the code copied were changed and decreased to fit the spaces properly.</h5>
<b>First of all, we define the basic properties with Player.js</b>
```javascript
'use strict';
var sampleplayer = sampleplayer || {};
var constantUpdateServer = '';
var finalDataServer = 'http://10.1.48.225:9999/';
sampleplayer.CastPlayer = function(element) {
```

The sampleplayer is the javascript object that will be used to call all the functions, variables and orient the API process.<br>
The constantupdateServer is the server that will have all the events information updated at the same time that they occur<br>
The finalDataServer (could be the same) is the one that will receive the final information from each Cast Session<br><br>

<b>Then, the basic variables are determined</b>
```javascript
  /*
   * The interval set for time divisions
   * @private
   */
  this.timeInterval_ =  1;
```
This one represents the division of interval (seconds) for the data track implemented.
```javascript
/*
   * The dictionary with the data capture from each video
   * @private
   */
  
  this.videoStatsData_ = {};

  /*
   * The licenseUrl if needed
   * @private
   */
  
  this.licenseUrl_ = '';
```
This are <b> important <b> variables. They define a licenseUrl, used for streaming services with DRM for example, and the main variable videoStatsData that collects information from each cast session for each contentId and send it to an external server.

<b>Another fundamental step, setting the media listener events</b>
```javascript
/**
   * The media element.
   * @private {HTMLMediaElement}
   */
  this.mediaElement_ = /** @type {HTMLMediaElement} */
      (this.element_.querySelector('video'));
  this.mediaElement_.addEventListener('error', this.onError_.bind(this), false);
  this.mediaElement_.addEventListener('playing', this.onPlaying_.bind(this),
      false);
  this.mediaElement_.addEventListener('pause', this.onPause_.bind(this), false);
  this.mediaElement_.addEventListener('ended', this.onEnded_.bind(this), false);
  this.mediaElement_.addEventListener('abort', this.onAbort_.bind(this), false);
  this.mediaElement_.addEventListener('timeupdate', this.onProgress_.bind(this),
      false);
  this.mediaElement_.addEventListener('seeking', this.onSeekStart_.bind(this),
      false);
  this.mediaElement_.addEventListener('seeked', this.onSeekEnd_.bind(this),
      false);
  

  /**
   * The cast receiver manager.
   * @private {!cast.receiver.CastReceiverManager}
   */
  this.receiverManager_ = cast.receiver.CastReceiverManager.getInstance();
  this.receiverManager_.onReady = this.onReady_.bind(this);
  this.receiverManager_.onSystemVolumeChanged = this.onSystemVolumeChanged_.bind(this);
  ...
```
<b>Now, it's time to set the actual binding of events with mediaManager. This is basically what makes all the definitions work and the media actually plays.</b>
```javascript
/**
   * The remote media object.
   * @private {cast.receiver.MediaManager}
   */
  this.mediaManager_ = new cast.receiver.MediaManager(this.mediaElement_);

  /**
   * The original load callback.
   * @private {?function(cast.receiver.MediaManager.Event)}
   */
  this.onLoadOrig_ =
      this.mediaManager_.onLoad.bind(this.mediaManager_);
  this.mediaManager_.onLoad = this.onLoad_.bind(this);
```
<b> The functions that make the last step possible are provided right after. Here some examples of the added functions
to save data properly</b>
```javascript
sampleplayer.CastPlayer.prototype.sendAjaxData = function(dataContent, urlString) {
  var submit = $.ajax({
          url: urlString, 
          type: 'POST', 
          contentType: 'application/json', 
          data: JSON.stringify(dataContent),
        error: function(error) {
          console.log("Error.");
        }
      });
        submit.success(function (data) {
          console.log("Success");
      });
}
```
This is the function to make an AJAX call to send data in JSON format.
```javascript
sampleplayer.CastPlayer.prototype.onPlaying_ = function() {
this.constantUpdate_("Start/Restart");
....
```
This is the "Playing" event and the function that sends the constant update sending the information that the media started/restarted.
```javascript
sampleplayer.CastPlayer.prototype.onSenderDisconnected_ = function(event) {
this.sendAjaxData(this.videoStatsData_, finalDataServer);
...
```
This is the "Disconnected" event and the function that sends the final data stored to the final server with all the information from the cast session.

# Styles.js
It basically uses jQuery to change the css structure of the page. An example to easily change the background color:
```javascript
/changes the progress bar color
var progressColor = "rgb(255, 255, 255)";
/progress bar color
$('.player .progressBar').css("background-color", progressColor);
```

# Player.css
The player.css sample was really well designed and thought, but it was important to make some changes to fit the design structure usually used with Brightcove and to fix some bugs and possible problems. Basically, the parts changed were related to the play/pause, progress bar and logo, making a different template for the player itself.

An example
```css
.player .controls-progress {
  background-color: rgba(255, 255, 255, 0.2);
  height: 11px;
  margin-top: 18px;
  margin-bottom: 9px;
  width: 80%;
  margin-left: 10%;
  overflow: hidden;
  position: relative;
}
```

The controll progress bar css.


