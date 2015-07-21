# Custom Receiver Application - Player.html and Intro
As explained in the main folder README, the idea of the custom receiver is to allow easy ways to edit, store information and display other kind of content such as DRM-based ones. The chromecast device loads a simple html file (that must be simple, otherwise it would cause efficiency problems). This html file uses Javascript and CSS to provide the media management and style, using the chromecast API.
# Structure

<h5>Directory Tree</h5>
```
-player.html
-css
----- player.css
----- assets/
-js
----- player.js
----- styles.js
```
Player.html is the html loaded. Player.js coordinates the use of the API. Player.css coordinates the styling, and styles.js makes it easy to change the css if necessary without the need to go to the actual player.js code. Assets folder contains the images loaded.

# Player.js

<h7> WARNING: The parts of the code copied here were changed and decreased to fit the spaces properly.</h7><br>
<h5> Let's show some interesting examples of how the player.js works and also the messages.js connection. </h5><br>
<b>First of all, we define the basic properties with Player.js</b>
```javascript
'use strict';
var bcplayer = bcplayer || {};
bcplayer.CastPlayer = function(element) {
...
```

The bcplayer is the javascript object that will be used to call all the functions, variables and orient the API process.<br>

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
These are <b> important </b> variables for example. They define a licenseUrl, used for streaming services with DRM for example, and the main variable videoStatsData that collects information from each cast session for each contentId and send it to an external server.

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
This is the "Playing" event and the function that sends the constant update sending the information that the media started/restarted.
```javascript
bcplayer.CastPlayer.prototype.onSenderDisconnected_ = function(event) {
sendAjaxData(this.videoStatsData_, finalDataServer);
...
```
This is the "Disconnected" event and the function that sends the final data stored to the final server with all the information from the cast session.

## messages.js

<b> The messages.js files related to all the things that are externally related to the player. For instance, we get the data and adjust the functions/queue/plays with the main Player.js, but the functions that send the data externally, edit the player visualization with sender information or add the license url to the host.</b> <br>

<h5> We can find some examples here </h5>
<h7> Here are the external server functions</h7>

```javascript
var constantUpdateServer = '';
var finalDataServer = 'http://10.1.48.225:9999/';
```
The constantupdateServer is the server that will have all the events information updated at the same time that they occur<br>
The finalDataServer (could be the same) is the one that will receive the final information from each Cast Session<br><br>

```javascript
function sendAjaxData(dataContent, urlString) {
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
else if (type === 'color'){
       var progressColor = value;
       changeColor(progressColor);
...
```

Call an auxiliar function (on messages.js) to change the color of the theme


# Player.css

The player.css is totally defined by state. There is a division between phases. For instance, if a video is loading, there will be a specific styling/design for it. If the video is playing and it's a live video, then the style will change again. All the changes and states provided by the javascript files are translated into visualization changes via the .css states.

Example:

```css
.player[type="video"][state="playing"][live="true"] .controls-cur-time,
.player[type="video"][state="playing"][live="true"] .controls-total-time,
.player[type="video"][state="playing"][live="true"] .controls-progress {
  display: none !important;
}
```

## easy.css

<h5> The easy.css file is a very simple file to change quick things without the need to edit player.css </h5> <br>

The parts of the project that might be changed by easy.css are:<br>

* Progress bar color

* Background color

* Background image

* Logo image

* Watermark image

* Title text color of the current video on the screen

* Subtitle text color of the current video on the screen

* Filling image if there is no metadata from the sender for the loading/current video

* Filling image if there is no metadata from the sender for the next video in the queue



