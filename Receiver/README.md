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

```javascript
'use strict';
var sampleplayer = sampleplayer || {};
var constantUpdateServer = '';
var finalDataServer = 'http://10.1.48.225:9999/';
sampleplayer.CastPlayer = function(element) {
```

```javascript
  /*
   * The title of the video
   * @private
   */
  this.title_ = "";


  /*
   * The interval set for time divisions
   * @private
   */
  this.timeInterval_ =  1;
```

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
```

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
```javascript
sampleplayer.CastPlayer.prototype.onPlaying_ = function() {
this.constantUpdate_("Start/Restart");
```
```javascript
sampleplayer.CastPlayer.prototype.onSenderDisconnected_ = function(event) {
this.sendAjaxData(this.videoStatsData_, finalDataServer);
```
# Player.css
kokjbbb

