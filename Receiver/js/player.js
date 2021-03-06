/** 
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

'use strict';


/**
 * Namespace
 */
var bcplayer = bcplayer || {};

/**
 * 
 * Cast player constructor - 
 * Main functions:
 * Bind a listener to "visibility change"
 * Set the default states
 * Bind event listeners for img & video tags: error, stalled, waiting, playing, pause, ended, timeupdate, seeking, etc
 * Create the MediaManager and bind the functions related to it
 * 
 * @param {!Element} element the element to attach the player
 * @struct
 * @constructor
 * @export
 */
bcplayer.CastPlayer = function(element) {
   
  /*
  /*  All the data structures to keep track of the information released by the player
  **************************************************************************************

   /*
   * The last second watched
   * @private
   */
  this.lastSecond_ = 0;

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

  /*
   * The dictionary of arrays of time divisions for each video
   * @private
   */

  this.timeArray_ = {};

   /*
   * All the timestamps (seconds) watched for each video
   * @private
   */
  this.secondsSeen_ = {};

   /*
   * All the timestamps (seconds) when the video was paused 
   * @private
   */
  this.secondsPaused_ = {};

  /*
   * All the timestamps (seconds) when the video was started/restarted
   * @private
   */
  this.secondsRestart_ = {};

  /*
   * All the timestamps (seconds) when the video volume changed
   * @private
   */
  this.secondsVolumeChanged_ = {};

  /*
   * List of videos watched for each Cast Session
   * @private
   */
  this.listOfVideosWatched_ = [];

  /*
   * The last milestone achieved by a video
   * @private
   */
  
  this.lastMilestone_ = {};

   /*
   * The current percentage watched for this video
   * @private
   */
  
  this.PctWatched_ = {};

  /*
   * The dictionary with the data capture from each video
   * @private
   */
  
  this.videoStatsData_ = {};

  /*
   * The licenseUrl if needed
   * @private
   */
  
  this.licenseUrl_ = null;

   /*
   * The license credentials if needed
   * @private
   */
  
  this.licenseCredentials_ = null;

   /*
   * The manifest credentials if needed
   * @private
   */
  
  this.manifestCredentials_ = null;

   /*
   * The segment credentials if needed
   * @private
   */
  
  this.segmentCredentials_ = null;

  /*
   * The current max bandwith in use for the current host
   * @private
   */
  
  this.maxBandwith_ = null;

  /*
   * The list of items in the queue in order
   * @private
   */
  
  this.currentQueue_ = null;

  /*
   * The current playing item of the queue
   * @private
   */
  
  this.currentQueueItemId_ = null;

  /*
   * The current playlist medias
   * @private
   */
  
  this.playlist_ = null;



  /*
  /*  All the necesssary listeners and functions to start the player
  ***********************************************************************

  /**
   * The debug setting to control receiver, MPL and player logging.
   * @private {boolean}
   */

  this.debug_ = bcplayer.DISABLE_DEBUG_;
  if (this.debug_) {
    cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);
    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
  }


  /**
   * The DOM element the player is attached.
   * @private {!Element}
   */
  this.element_ = element;

  /**
   * The current type of the player.
   * @private {bcplayer.Type}
   */
  this.type_;

  this.setType_(bcplayer.Type.UNKNOWN, false);

  /**
   * The current state of the player.
   * @private {bcplayer.State}
   */
  this.state_;
  
 
  /**
   * Timestamp when state transition happened last time.
   * @private {number}
   */
  this.lastStateTransitionTime_ = 0;

  this.setState_(bcplayer.State.LAUNCHING, false);

  /**
   * The id returned by setInterval for the screen burn timer
   * @private {number|undefined}
   */
  this.burnInPreventionIntervalId_;

  /**
   * The id returned by setTimeout for the idle timer
   * @private {number|undefined}
   */
  this.idleTimerId_;

  /**
   * The id of timer to handle seeking UI.
   * @private {number|undefined}
   */
  this.seekingTimerId_;

  /**
   * The id of timer to defer setting state.
   * @private {number|undefined}
   */
  this.setStateDelayTimerId_;

  /**
   * Current application state.
   * @private {string|undefined}
   */
  this.currentApplicationState_;

  /**
   * The DOM element for the inner portion of the progress bar.
   * @private {!Element}
   */
  this.progressBarInnerElement_ = this.getElementByClass_(
      '.controls-progress-inner');

  /**
   * The DOM element for the thumb portion of the progress bar.
   * @private {!Element}
   */
  this.progressBarThumbElement_ = this.getElementByClass_(
      '.controls-progress-thumb');

  /**
   * The DOM element for the current time label.
   * @private {!Element}
   */
  this.curTimeElement_ = this.getElementByClass_('.controls-cur-time');

  /**
   * The DOM element for the total time label.
   * @private {!Element}
   */
  this.totalTimeElement_ = this.getElementByClass_('.controls-total-time');

  /**
   * The DOM element for the preview time label.
   * @private {!Element}
   */
  this.previewModeTimerElement_ = this.getElementByClass_('.preview-mode-timer-countdown');

  /**
   * Handler for buffering-related events for MediaElement.
   * @private {function()}
   */
  this.bufferingHandler_ = this.onBuffering_.bind(this);

  /**
   * Media player to play given manifest.
   * @private {cast.player.api.Player}
   */
  this.player_ = null;

  /**
   * Media player used to preload content.
   * @private {cast.player.api.Player}
   */
  this.preloadPlayer_ = null;

  /**
   * Text Tracks currently supported.
   * @private {?bcplayer.TextTrackType}
   */
  this.textTrackType_ = null;

  /**
   * Whether player app should handle autoplay behavior.
   * @private {boolean}
   */
  this.playerAutoPlay_ = false;

  /**
   * Whether player app should display the preview mode UI.
   * @private {boolean}
   */
  this.displayPreviewMode_ = false;

  /**
   * Id of deferred play callback
   * @private {?number}
   */
  this.deferredPlayCallbackId_ = null;

  /**
   * Whether the player is ready to receive messages after a LOAD request.
   * @private {boolean}
   */
  this.playerReady_ = false;

  /**
   * Whether the player has received the metadata loaded event after a LOAD
   * request.
   * @private {boolean}
   */
  this.metadataLoaded_ = false;

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
  this.mediaElement_.addEventListener('loadeddata', this.onLoadedData_.bind(this),
      false);
  

  /**
   * The cast receiver manager.
   * @private {!cast.receiver.CastReceiverManager}
   */
  this.receiverManager_ = cast.receiver.CastReceiverManager.getInstance();
  this.receiverManager_.onReady = this.onReady_.bind(this);
  this.receiverManager_.onSystemVolumeChanged = this.onSystemVolumeChanged_.bind(this);
  this.receiverManager_.onSenderConnected = this.onSenderConnected_.bind(this);
  this.receiverManager_.onSenderDisconnected =
      this.onSenderDisconnected_.bind(this);
  this.receiverManager_.onVisibilityChanged =
      this.onVisibilityChanged_.bind(this);
  this.receiverManager_.setApplicationState(
      bcplayer.getApplicationState_());
  
  //Set and bind messageBus
  this.messageBus_ = this.receiverManager_.getCastMessageBus(
      'urn:x-cast:com.google.cast.sample.mediaplayer');
  this.messageBus_.onMessage = this.onMessage_.bind(this);

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

  /**
   * The original editTracksInfo callback
   * @private {?function(!cast.receiver.MediaManager.Event)}
   */
  this.onEditTracksInfoOrig_ =
      this.mediaManager_.onEditTracksInfo.bind(this.mediaManager_);
  this.mediaManager_.onEditTracksInfo = this.onEditTracksInfo_.bind(this);

  /**
   * The original metadataLoaded callback
   * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
   */
  this.onMetadataLoadedOrig_ =
      this.mediaManager_.onMetadataLoaded.bind(this.mediaManager_);
  this.mediaManager_.onMetadataLoaded = this.onMetadataLoaded_.bind(this);
  
  /**
   * The original stop callback.
   * @private {?function(cast.receiver.MediaManager.Event)}
   */
  this.onStopOrig_ =
      this.mediaManager_.onStop.bind(this.mediaManager_);
  this.mediaManager_.onStop = this.onStop_.bind(this);

  /**
   * The original metadata error callback.
   * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
   */
  this.onLoadMetadataErrorOrig_ =
      this.mediaManager_.onLoadMetadataError.bind(this.mediaManager_);
  this.mediaManager_.onLoadMetadataError = this.onLoadMetadataError_.bind(this);

  /**
   * The original error callback
   * @private {?function(!Object)}
   */
  this.onErrorOrig_ =
      this.mediaManager_.onError.bind(this.mediaManager_);
  this.mediaManager_.onError = this.onError_.bind(this);


  /**
   * Status callback and preload
   */
  this.mediaManager_.customizedStatusCallback =
      this.customizedStatusCallback_.bind(this);

  this.mediaManager_.onPreload = this.onPreload_.bind(this);
  this.mediaManager_.onCancelPreload = this.onCancelPreload_.bind(this);

   /**
   * Queue functions
   * The original and the event listener added
   */

  this.onQueueLoadOrig_ = 
      this.mediaManager_.onQueueLoad.bind(this.mediaManager_);
  this.mediaManager_.onQueueLoad = this.onQueueLoad_.bind(this);

  this.onQueueInsertOrig_ = 
      this.mediaManager_.onQueueInsert.bind(this.mediaManager_);
  this.mediaManager_.onQueueInsert = this.onQueueInsert_.bind(this);

  this.onQueueRemoveOrig_ = 
      this.mediaManager_.onQueueRemove.bind(this.mediaManager_);
  this.mediaManager_.onQueueRemove = this.onQueueRemove_.bind(this);

  this.onQueueUpdateOrig_ = 
      this.mediaManager_.onQueueUpdate.bind(this.mediaManager_);
  this.mediaManager_.onQueueUpdate = this.onQueueUpdate_.bind(this);

  this.onQueueReorderOrig_ = 
      this.mediaManager_.onQueueReorder.bind(this.mediaManager_);
  this.mediaManager_.onQueueReorder = this.onQueueReorder_.bind(this);

  this.onQueueEndedOrig_ = 
      this.mediaManager_.onQueueEnded.bind(this.mediaManager_);
  this.mediaManager_.onQueueEnded = this.onQueueEnded_.bind(this);

};

//Constructor Ended. The states and related definitions start. 

/**
 * The amount of time in a given state before the player goes idle.
 */
bcplayer.IDLE_TIMEOUT = {
  LAUNCHING: 1000 * 60 * 5, // 5 minutes
  LOADING: 1000 * 60 * 5,  // 5 minutes
  PAUSED: 1000 * 60 * 60,  // 60 minutes 
  DONE: 1000 * 60 * 5,     // 5 minutes
  IDLE: 1000 * 60 * 5      // 5 minutes
};


/**
 * Describes the type of media being played.
 *
 * @enum {string}
 */
bcplayer.Type = {
  AUDIO: 'audio',
  VIDEO: 'video',
  UNKNOWN: 'unknown'
};


/**
 * Describes the type of captions being used.
 *
 * @enum {string}
 */
bcplayer.TextTrackType = {
  SIDE_LOADED_TTML: 'ttml',
  SIDE_LOADED_VTT: 'vtt',
  SIDE_LOADED_UNSUPPORTED: 'unsupported',
  EMBEDDED: 'embedded'
};


/**
 * Describes the type of captions being used.
 *
 * @enum {string}
 */
bcplayer.CaptionsMimeType = {
  TTML: 'application/ttml+xml',
  VTT: 'text/vtt'
};


/**
 * Describes the type of track.
 *
 * @enum {string}
 */
bcplayer.TrackType = {
  AUDIO: 'audio',
  VIDEO: 'video',
  TEXT: 'text'
};


/**
 * Describes the state of the player.
 *
 * @enum {string}
 */
bcplayer.State = {
  LAUNCHING: 'launching',
  LOADING: 'loading',
  BUFFERING: 'buffering',
  PLAYING: 'playing',
  PAUSED: 'paused',
  DONE: 'done',
  IDLE: 'idle'
};

/**
 * The amount of time (in ms) a screen should stay idle before burn in
 * prevention kicks in
 *
 * @type {number}
 */
bcplayer.BURN_IN_TIMEOUT = 30 * 1000;

/**
 * The minimum duration (in ms) that media info is displayed.
 *
 * @const @private {number}
 */
bcplayer.MEDIA_INFO_DURATION_ = 3 * 1000;


/**
 * Transition animation duration (in sec).
 *
 * @const @private {number}
 */
bcplayer.TRANSITION_DURATION_ = 1.5;


/**
 * Const to enable debugging.
 *
 * @const @private {boolean}
 */
bcplayer.ENABLE_DEBUG_ = true;


/**
 * Const to disable debugging.
 *
 * #@const @private {boolean}
 */
bcplayer.DISABLE_DEBUG_ = false;


/**
 * All functions
 ***************
 */


/*
 * First, the Data Track auxiliar functions
 ******************************************
 */


 /**
 * Returns the array of int intervals for a determined video
 *
 * @param duration and the interval set
 * @return Array of Ints
 * @private
 */

bcplayer.CastPlayer.prototype.getArrayOfIntervals_ = function userData(interval, totaltime) {

      totaltime = parseInt(totaltime);
      if(interval<totaltime && interval>0){
        var intervalArray = [0];

          var i = interval;
        while(i<totaltime){
          intervalArray.push(i);
          i = i + interval
        }
        return intervalArray;
        } else {
          return null;
        }  
}

/**
 * Add a second (seen, paused, restarted, volume) to a determined array related to an event
 *
 * @param array and the Int related
 * @return Void
 * @private
 */
bcplayer.CastPlayer.prototype.addSecond = function(array, second) {
  if(array.indexOf(second) == -1){
    array.push(second);
  }
}

/**
 * Handle the credentials for the media
 *
 * @param media host
 * @return Void
 * @private
 */
bcplayer.CastPlayer.prototype.checkCredentials_ = function(mediaHost){
  //Check all the possible credentials
  if (this.manifestCredentials_) {
          mediaHost.updateManifestRequestInfo = function(requestInfo) {
            if (!requestInfo.url) {
              requestInfo.url = url;
            }
            requestInfo.withCredentials = true;
          };
  }
  if (this.segmentCredentials_) {
    mediaHost.updateSegmentRequestInfo = function(requestInfo) {
      requestInfo.withCredentials = true;
      // example of setting headers - it should be CHANGED for different use cases
      requestInfo.headers = {};
      requestInfo.headers['content-type'] = 'text/xml;charset=utf-8';
    };
  }
  if (this.licenseCredentials_) {
    mediaHost.updateLicenseRequestInfo = function(requestInfo) {
      requestInfo.withCredentials = true;
    };
  } 

};

/**
 * Check if one of the time milestone was achieved
 *
 * @param array of seconds, duration of the video, oldMilestone achieved
 * @return milestone
 * @private
 */

bcplayer.CastPlayer.prototype.checkMilestone = function(array, duration, oldMilestone){
  var watched = array.length;
  var total = parseInt(duration);
  var percentage = watched/total;
  var milestone = 0;

  if(percentage>0.9){
    var milestone = 0.9;
  } else if(percentage>0.75){
    var milestone = 0.75;
  } else if(percentage>0.5) {
    var milestone = 0.5;
  } else if(percentage>0.25){
    var milestone = 0.25;
  } else {
    var milestone = 0;
  }

  if(oldMilestone != milestone){
    return milestone;
  } else{
    return oldMilestone;
  }
}

/**
 * onMessage functions to use custom information sent by the sender App.
 *
 * @param the message event
 * @return void
 * @private
 */

bcplayer.CastPlayer.prototype.onMessage_ = function(event){
  var myEvent = JSON.parse(event['data']);
  var type = myEvent['type'];
  var value = myEvent.value
  dealWithMessage(this, type, value);
};

/**
 * Changes the color pattern for the project
 *
 * @param color
 * @return void
 * @private
 */

bcplayer.CastPlayer.prototype.changeColorPattern = function(rgb){
  try {
    rgb = String(rgb);
    function setWebkitColor(element, color){
      var rgba = String(color.replace(')', ', 0.5)').replace('rgb', 'rgba'));
      rgba = rgba+' 0px 0px 15px 5px';
      $(element).css('-webkit-box-shadow', rgba);
      $(element).css('-moz-box-shadow', rgba);
      $(element).css('box-shadow', rgba);
      $(element).css('border', rgba);
    }
    
    setWebkitColor('.media-artwork', rgb);
    setWebkitColor('.preview-mode-artwork', rgb);
    $('.player .progressBar').css('background-color', rgb);
    $('.preview-mode-timer').css('color', rgb);  
  } 
  catch(err) {
    console.log('Color Pattern Error')
  }
}

/**
 * Shows the playlist bar when called
 *
 * @param none
 * @return void
 * @private
 */

bcplayer.CastPlayer.prototype.showPlaylist_ = function(item, message){
  
  //Boolean variables to check if the player is able to show the playlist animation
  var timeLeft = parseInt(this.mediaElement_.duration) - parseInt(this.mediaElement_.currentTime);
  var isPlaying = this.state_ === bcplayer.State.PLAYING;
  var enoughTimeLeft = timeLeft>9;
  var notDisplayingPreview = $('.preview-mode-info').css('display') == 'none';
  
  //Check boolean variables
  if(isPlaying && enoughTimeLeft && notDisplayingPreview){
    
    //gets metadata
    var media = this.playlist_[item].media;
    var metadata = media.metadata || {};
    var imgUrl = bcplayer.getMediaImageUrl_(media);
    var title = media.metadata.title || '';
    var subtitle = media.metadata.subtitle || '';
    
    //Start the 'show playlist' process
    if (imgUrl) {
      var artworkElement = this.element_.querySelector('.preview-mode-artwork');
      bcplayer.setBackgroundImage_(artworkElement, imgUrl);
    }
    $('.preview-mode-timer-countdown').text(message);
    $('.preview-mode-title').text(title);
    $('.preview-mode-subtitle').text(subtitle);
    $('.preview-mode-timer-starts').css('display', 'none');
    $('.preview-mode-timer-sec').css('display', 'none');
    
    //Fade effect
    $('.player .gradient-to-bottom').css('display', 'block');
    $('.player .gradient-to-bottom').css('visibility', 'visible');
    $('.player .gradient-to-bottom').fadeTo(2000, 0.8);
    $('.preview-mode-info').css('display', 'flex');
    $('.preview-mode-info').fadeTo(2000, 1);
    $('.preview-mode-info').css('visibility', 'visible');
    //Fade out after some seconds
    setTimeout(function(){
      $('.preview-mode-info').fadeTo(1500, 0);
      $('.player .gradient-to-bottom').fadeTo(1500, 0);
    }, 3000)
    setTimeout(function(){
      $('.preview-mode-info').css('display', 'none');
      $('.preview-mode-timer').css('display', 'flex');
      $('.player .gradient-to-bottom').css('display', 'none');
    $('.player .gradient-to-bottom').css('visibility', 'hidden');
    }, 4500)
  }
}

/**
 * Handler for the loadedData event. Attempt to capture bitrates/video quality for the streaming video
 *
 * @param none
 * @return void
 * @private
 */

bcplayer.CastPlayer.prototype.onLoadedData_ = function(){ 
  //Set color pattern
  var color = $('.progressBar').css('background-color');
  this.changeColorPattern(color);
  //Get data from the player and send update
  var media = this.mediaManager_.getMediaInformation();
  var tempId = media.contentId;
  var tempDuration = media.duration;
  if(media.metadata != undefined){
    if(media.metadata.title != undefined){
      var tempTitle = media.metadata.title;
    } else{
        var tempTitle = '';
    }
  }else{
    var tempTitle = '';
  }
  var tempConstant = [tempId, tempTitle, tempDuration];
  constantUpdate("Constant", tempConstant);
  
  if(this.player_ != null){
    var protocol = this.player_.getStreamingProtocol();
    var streamCount = protocol.getStreamCount();
    var streamInfo;
    var streamVideoCodecs;
    var streamAudioCodecs;
    var captions = {};
    var streamVideoBitrates;
    var videoStreamIndex;
    
    //parse through all the stream divisions data
    for (var c = 0; c < streamCount; c++) {
      streamInfo = protocol.getStreamInfo(c);
      if (streamInfo.mimeType === 'text') {
        captions[c] = streamInfo.language;
      } else if (streamInfo.mimeType === 'video/mp4' ||
          streamInfo.mimeType === 'video/mp2t') {
        streamVideoCodecs = streamInfo.codecs;
        streamVideoBitrates = streamInfo.bitrates;
        if (this.maxBandwith_) {
            var videoLevel = protocol.getQualityLevel(c, this.maxBandwith_);
          }
        else {
            var videoLevel = protocol.getQualityLevel(c);
          }
        videoStreamIndex = c;
      } 
      else {
      }
    }
    
    //Get and send captions data
    if (Object.keys(captions).length > 0) {
      var caption_message = {};
      caption_message['captions'] = captions;
      constantUpdate("Captions", caption_message);
    }
    //Get and send bitrates division data
    if (streamVideoBitrates && Object.keys(streamVideoBitrates).length > 0) {
      var video_bitrates_message = {};
      video_bitrates_message['video_bitrates'] = streamVideoBitrates;
      constantUpdate("Bitrates", video_bitrates_message);
    }
  }
};

/*
 * Now, the player functions
 ***************************************************
 */


/**
 * Returns the element with the given class name
 *
 * @param {string} className The class name of the element to return.
 * @return {!Element}
 * @throws {Error} If given class cannot be found.
 * @private
 */
bcplayer.CastPlayer.prototype.getElementByClass_ = function(className) {
  var element = this.element_.querySelector(className);
  if (element) {
    return element;
  } else {
    throw Error('Cannot find element with class: ' + className);
  }
};


/**
 * Returns this player's media element.
 *
 * @return {HTMLMediaElement} The media element.
 * @export
 */
bcplayer.CastPlayer.prototype.getMediaElement = function() {
  return this.mediaElement_;
};


/**
 * Returns this player's media manager.
 *
 * @return {cast.receiver.MediaManager} The media manager.
 * @export
 */
bcplayer.CastPlayer.prototype.getMediaManager = function() {
  return this.mediaManager_;
};


/**
 * Returns this player's MPL player.
 *
 * @return {cast.player.api.Player} The current MPL player.
 * @export
 */
bcplayer.CastPlayer.prototype.getPlayer = function() {
  return this.player_;
};


/**
 * Starts the player.
 *
 * @export
 */
bcplayer.CastPlayer.prototype.start = function() {
  this.receiverManager_.start();
};


/**
 * Preloads the given data.
 *
 * @param {!cast.receiver.media.MediaInformation} mediaInformation The
 *     asset media information.
 * @return {boolean} Whether the media can be preloaded.
 * @export
 */
bcplayer.CastPlayer.prototype.preload = function(mediaInformation) {
  this.log_('preload');
  // For video formats that cannot be preloaded (mp4...), display preview UI.
  if (bcplayer.canDisplayPreview_(mediaInformation || {})) {
    this.showPreviewMode_(mediaInformation);
    return true;
  }
  if (!bcplayer.supportsPreload_(mediaInformation || {})) {
    this.log_('preload: no supportsPreload_');
    return false;
  }
  if (this.preloadPlayer_) {
    this.preloadPlayer_.unload();
    this.preloadPlayer_ = null;
  }
  // Only videos are supported for now
  var couldPreload = this.preloadVideo_(mediaInformation);
  if (couldPreload) {
    this.showPreviewMode_(mediaInformation);
  }
  this.log_('preload: couldPreload=' + couldPreload);
  return couldPreload;
};


/**
 * Display preview mode metadata.
 *
 * @param {boolean} show whether player is showing preview mode metadata
 * @export
 */
bcplayer.CastPlayer.prototype.showPreviewModeMetadata = function(show) {
  this.element_.setAttribute('preview-mode', show.toString());
};

/**
 * Show the preview mode UI.
 *
 * @param {!cast.receiver.media.MediaInformation} mediaInformation The
 *     asset media information.
 * @private
 */
bcplayer.CastPlayer.prototype.showPreviewMode_ = function(mediaInformation) {
  this.displayPreviewMode_ = true;
  this.loadPreviewModeMetadata_(mediaInformation);
  this.showPreviewModeMetadata(true);
};


/**
 * Hide the preview mode UI.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.hidePreviewMode_ = function() {
  this.showPreviewModeMetadata(false);
  this.displayPreviewMode_ = false;
};


/**
 * Preloads some video content.
 *
 * @param {!cast.receiver.media.MediaInformation} mediaInformation The
 *     asset media information.
 * @return {boolean} Whether the video can be preloaded.
 * @private
 */
bcplayer.CastPlayer.prototype.preloadVideo_ = function(mediaInformation) {
  this.log_('preloadVideo_');
  var self = this;
  var url = mediaInformation.contentId;
  var protocolFunc = bcplayer.getProtocolFunction_(mediaInformation);
  if (!protocolFunc) {
    this.log_('No protocol found for preload');
    return false;
  }
  var host = new cast.player.api.Host({
    'url': url,
    'mediaElement': self.mediaElement_
  });
  // run license check
  checkLicense(this, host, url);

  host.onError = function() {
    self.preloadPlayer_.unload();
    self.preloadPlayer_ = null;
    self.showPreviewModeMetadata(false);
    self.displayPreviewMode_ = false;
    self.log_('Error during preload');
  };
  self.preloadPlayer_ = new cast.player.api.Player(host);
  self.preloadPlayer_.preload(protocolFunc(host));
  //this.currentProtocol_ = protocolFunc(host);
  return true;
};

/**
 * Loads the given data.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @export
 */
bcplayer.CastPlayer.prototype.load = function(info) {
  this.log_('onLoad_');
  clearTimeout(this.idleTimerId_);
  //Set color pattern
  var color = $('.progressBar').css('background-color');
  this.changeColorPattern(color);
  //Load
  var self = this;
  var media = info.message.media || {};
  var contentType = media.contentType;
  var playerType = bcplayer.getType_(media);
  var isLiveStream = media.streamType === cast.receiver.media.StreamType.LIVE;
  if (!media.contentId) {
    this.log_('Load failed: no content');
    self.onLoadMetadataError_(info);
  } else if (playerType === bcplayer.Type.UNKNOWN) {
    this.log_('Load failed: unknown content type: ' + contentType);
    self.onLoadMetadataError_(info);
  } else {
    this.log_('Loading: ' + playerType);
    self.resetMediaElement_();
    self.setType_(playerType, isLiveStream);
    var preloaded = false;
    switch (playerType) {
      case bcplayer.Type.AUDIO:
        self.loadAudio_(info);
        break;
      case bcplayer.Type.VIDEO:
        preloaded = self.loadVideo_(info);
        break;
    }
    self.playerReady_ = false;
    self.metadataLoaded_ = false;
    self.loadMetadata_(media);
    self.showPreviewModeMetadata(false);
    self.displayPreviewMode_ = false;
    bcplayer.preload_(media, function() {
      self.log_('preloaded=' + preloaded);
      if (preloaded) {
        // Data is ready to play so transiton directly to playing.
        self.setState_(bcplayer.State.PLAYING, false);
        self.playerReady_ = true;
        self.maybeSendLoadCompleted_(info);
        // Don't display metadata again, since autoplay already did that.
        self.deferPlay_(0);
        self.playerAutoPlay_ = false;
      } else {
        bcplayer.transition_(self.element_, bcplayer.TRANSITION_DURATION_, function() {
          self.setState_(bcplayer.State.LOADING, false);
          // Only send load completed after we reach this point so the media
          // manager state is still loading and the sender can't send any PLAY
          // messages
          self.playerReady_ = true;
          self.maybeSendLoadCompleted_(info);
          if (self.playerAutoPlay_) {
            // Make sure media info is displayed long enough before playback
            // starts.
            self.deferPlay_(bcplayer.MEDIA_INFO_DURATION_);
            self.playerAutoPlay_ = false;
          }
        });
      }
    });
  }
};

/**
 * Sends the load complete message to the sender if the two necessary conditions
 * are met, the player is ready for messages and the loaded metadata event has
 * been received.
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.maybeSendLoadCompleted_ = function(info) {
  if (!this.playerReady_) {
    this.log_('Deferring load response, player not ready');
  } else if (!this.metadataLoaded_) {
    this.log_('Deferring load response, loadedmetadata event not received');
  } else {
    this.onMetadataLoadedOrig_(info);
    this.log_('Sent load response, player is ready and metadata loaded');
  }
};

/**
 * Resets the media element.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.resetMediaElement_ = function() {
  this.log_('resetMediaElement_');
  if (this.player_) {
    this.player_.unload();
    this.player_ = null;
  }
  this.textTrackType_ = null;
};


/**
 * Loads the metadata for the given media.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media.
 * @private
 */
bcplayer.CastPlayer.prototype.loadMetadata_ = function(media) {
  this.log_('loadMetadata_');
  if (!bcplayer.isCastForAudioDevice_()) {
    var metadata = media.metadata || {};
    var titleElement = this.element_.querySelector('.media-title');
    //set media title if defined
    if(metadata != undefined){
      this.title_ = metadata.title;
    }else{
      this.title_ = ""
    }
    bcplayer.setInnerText_(titleElement, this.title_);

    var subtitleElement = this.element_.querySelector('.media-subtitle');
    //If there is a queue, show the item position in the queue as subtitle
    if(this.currentQueue_ && this.currentQueue_.length>1){
      var queueInfo = "Queue item " +(this.currentQueue_.indexOf(this.currentQueueItemId_)+1)+ " of "+this.currentQueue_.length;
      var subtitle = queueInfo;
      bcplayer.setInnerText_(subtitleElement, subtitle);
    } else{
      bcplayer.setInnerText_(subtitleElement, metadata.subtitle);
    }
    //show artwork if defined
    var artwork = bcplayer.getMediaImageUrl_(media);
    if (artwork) {
      var artworkElement = this.element_.querySelector('.media-artwork');
      bcplayer.setBackgroundImage_(artworkElement, artwork);
    }
  }
};


/**
 * Loads the metadata for the given preview mode media.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media.
 * @private
 */
bcplayer.CastPlayer.prototype.loadPreviewModeMetadata_ = function(media) {
  this.log_('loadPreviewModeMetadata_');
  if (!bcplayer.isCastForAudioDevice_()) {
    var metadata = media.metadata || {};
    var titleElement = this.element_.querySelector('.preview-mode-title');
    bcplayer.setInnerText_(titleElement, metadata.title);

    var artwork = bcplayer.getMediaImageUrl_(media);
    if (artwork) {
      var artworkElement = this.element_.querySelector('.preview-mode-artwork');
      bcplayer.setBackgroundImage_(artworkElement, artwork);
    }

    var subtitleElement = this.element_.querySelector('.preview-mode-subtitle');
    if(this.currentQueue_ && this.currentQueue_.length>1){
      var queueInfo = "Queue item " +(this.currentQueue_.indexOf(this.currentQueueItemId_)+2)+ " of "+this.currentQueue_.length;
      bcplayer.setInnerText_(subtitleElement, queueInfo);
    } else{
      bcplayer.setInnerText_(subtitleElement, metadata.subtitle);
    }

  }
};

/**
 * Lets player handle autoplay, instead of depending on underlying
 * MediaElement to handle it. By this way, we can make sure that media playback
 * starts after loading screen is displayed.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.letPlayerHandleAutoPlay_ = function(info) {
  this.log_('letPlayerHandleAutoPlay_: ' + info.message.autoplay);
  var autoplay = info.message.autoplay;
  info.message.autoplay = false;
  this.mediaElement_.autoplay = false;
  this.playerAutoPlay_ = autoplay == undefined ? true : autoplay;
};

/**
 * Loads some audio content.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.loadAudio_ = function(info) {
  this.log_('loadAudio_');
  this.letPlayerHandleAutoPlay_(info);
  this.loadDefault_(info);
};


/**
 * Loads some video content.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @return {boolean} Whether the media was preloaded
 * @private
 */
bcplayer.CastPlayer.prototype.loadVideo_ = function(info) {
  this.log_('loadVideo_');
  var self = this;
  var protocolFunc = null;
  var url = info.message.media.contentId;
  var protocolFunc = bcplayer.getProtocolFunction_(info.message.media);
  var wasPreloaded = false;

  this.letPlayerHandleAutoPlay_(info);
  if (!protocolFunc) {
    this.log_('loadVideo_: using MediaElement');
    this.mediaElement_.addEventListener('stalled', this.bufferingHandler_,
        false);
    this.mediaElement_.addEventListener('waiting', this.bufferingHandler_,
        false);
  } else {
    this.log_('loadVideo_: using Media Player Library');
    // When MPL is used, buffering status should be detected by
    // getState()['underflow]'
    this.mediaElement_.removeEventListener('stalled', this.bufferingHandler_);
    this.mediaElement_.removeEventListener('waiting', this.bufferingHandler_);

    // If we have not preloaded or the content preloaded does not match the
    // content that needs to be loaded, perform a full load
    var loadErrorCallback = function(errorCode) {
      console.log("DEBUGGER: Fatal Error - " + errorCode);

      //Change the screen to a DRM failed message: 'This streaming is invalid', when there is an invalid URL license
      function setDRMmessage(){
        try {
          $('.background').css('opacity', 0);
          $('.logo').fadeTo(2000, 0);
          $('.DRMerror').fadeTo(2000, 1);
          setTimeout(function() {
                $('.background').fadeTo(2000, 1);
                $('.logo').fadeTo(2000, 1);
                $('.DRMerror').fadeTo(2000, 0);
             }, 10000);
        } 
        catch(err) {
          console.log('DRM Message error');
        }
      };

      //unload player and trigger error event on media element
      if (self.player_) {
        if(parseInt(errorCode) == 2){
          setDRMmessage();
        }
        self.resetMediaElement_();
        self.mediaElement_.dispatchEvent(new Event('error'));
      }
    };
    if (!this.preloadPlayer_ || (this.preloadPlayer_.getHost &&
        this.preloadPlayer_.getHost().url != url)) {
      if (this.preloadPlayer_) {
        this.preloadPlayer_.unload();
        this.preloadPlayer_ = null;
      }
      this.log_('Regular video load');
      var host = new cast.player.api.Host({
        'url': url,
        'mediaElement': this.mediaElement_
      });
      //run license check
      checkLicense(this, host, url);

      host.onError = loadErrorCallback;

      this.player_ = new cast.player.api.Player(host);
      this.player_.load(protocolFunc(host));
      //this.currentProtocol_ = protocolFunc(host);
    } else {
      this.log_('Preloaded video load');
      this.player_ = this.preloadPlayer_;
      this.preloadPlayer_ = null;
      // Replace the "preload" error callback with the "load" error callback
      this.player_.getHost().onError = loadErrorCallback;
      this.player_.load();
      wasPreloaded = true;
    }
  }
  this.loadMediaManagerInfo_(info, !!protocolFunc);
  return wasPreloaded;
};


/**
 * Loads media and tracks info into media manager.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @param {boolean} loadOnlyTracksMetadata Only load the tracks metadata (if
 *     it is in the info provided).
 * @private
 */
bcplayer.CastPlayer.prototype.loadMediaManagerInfo_ =
    function(info, loadOnlyTracksMetadata) {

  if (loadOnlyTracksMetadata) {
    // In the case of media that uses MPL we do not
    // use the media manager default onLoad API but we still need to load
    // the tracks metadata information into media manager (so tracks can be
    // managed and properly reported in the status messages) if they are
    // provided in the info object (side loaded).
    this.maybeLoadSideLoadedTracksMetadata_(info);
  } else {
    // Media supported by mediamanager, use the media manager default onLoad API
    // to load the media, tracks metadata and, if the tracks are vtt the media
    // manager will process the cues too.
    this.loadDefault_(info);
  }
};


/**
 * Sets the captions type based on the text tracks.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.readSideLoadedTextTrackType_ =
    function(info) {
  if (!info.message || !info.message.media || !info.message.media.tracks) {
    return;
  }
  for (var i = 0; i < info.message.media.tracks.length; i++) {
    var oldTextTrackType = this.textTrackType_;
    if (info.message.media.tracks[i].type !=
        cast.receiver.media.TrackType.TEXT) {
      continue;
    }
    if (this.isTtmlTrack_(info.message.media.tracks[i])) {
      this.textTrackType_ =
          bcplayer.TextTrackType.SIDE_LOADED_TTML;
    } else if (this.isVttTrack_(info.message.media.tracks[i])) {
      this.textTrackType_ =
          bcplayer.TextTrackType.SIDE_LOADED_VTT;
    } else {
      this.log_('Unsupported side loaded text track types');
      this.textTrackType_ =
          bcplayer.TextTrackType.SIDE_LOADED_UNSUPPORTED;
      break;
    }
    // We do not support text tracks with different caption types for a single
    // piece of content
    if (oldTextTrackType && oldTextTrackType != this.textTrackType_) {
      this.log_('Load has inconsistent text track types');
      this.textTrackType_ =
          bcplayer.TextTrackType.SIDE_LOADED_UNSUPPORTED;
      break;
    }
  }
};


/**
 * If there is tracks information in the LoadInfo, it loads the side loaded
 * tracks information in the media manager without loading media.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.maybeLoadSideLoadedTracksMetadata_ =
    function(info) {
  // If there are no tracks we will not load the tracks information here as
  // we are likely in a embedded captions scenario and the information will
  // be loaded in the onMetadataLoaded_ callback
  if (!info.message || !info.message.media || !info.message.media.tracks ||
      info.message.media.tracks.length == 0) {
    return;
  }
  var tracksInfo = /** @type {cast.receiver.media.TracksInfo} **/ ({
    tracks: info.message.media.tracks,
    activeTrackIds: info.message.activeTrackIds,
    textTrackStyle: info.message.media.textTrackStyle
  });
  this.mediaManager_.loadTracksInfo(tracksInfo);
};


/**
 * Loads embedded tracks information without loading media.
 * If there is embedded tracks information, it loads the tracks information
 * in the media manager without loading media.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.maybeLoadEmbeddedTracksMetadata_ =
    function(info) {
  if (!info.message || !info.message.media) {
    return;
  }
  var tracksInfo = this.readInBandTracksInfo_();
  if (tracksInfo) {
    this.textTrackType_ = bcplayer.TextTrackType.EMBEDDED;
    tracksInfo.textTrackStyle = info.message.media.textTrackStyle;
    this.mediaManager_.loadTracksInfo(tracksInfo);
  }
};


/**
 * Processes ttml tracks and enables the active ones.
 *
 * @param {!Array.<number>} activeTrackIds The active tracks.
 * @param {!Array.<cast.receiver.media.Track>} tracks The track definitions.
 * @private
 */
bcplayer.CastPlayer.prototype.processTtmlCues_ =
    function(activeTrackIds, tracks) {
  if (activeTrackIds.length == 0) {
    return;
  }
  // If there is an active text track, that is using ttml, apply it
  for (var i = 0; i < tracks.length; i++) {
    var contains = false;
    for (var j = 0; j < activeTrackIds.length; j++) {
      if (activeTrackIds[j] == tracks[i].trackId) {
        contains = true;
        break;
      }
    }
    if (!contains ||
        !this.isTtmlTrack_(tracks[i])) {
      continue;
    }
    if (!this.player_) {
      // We do not have a player, it means we need to create it to support
      // loading ttml captions
      var host = new cast.player.api.Host({
        'url': '',
        'mediaElement': this.mediaElement_
      });
      //run license check
      checkLicense(this, host, '');

      this.protocol_ = null;
      this.player_ = new cast.player.api.Player(host);
    }
    this.player_.enableCaptions(
        true, cast.player.api.CaptionsType.TTML, tracks[i].trackContentId);
  }
};


/**
 * Checks if a track is TTML.
 *
 * @param {cast.receiver.media.Track} track The track.
 * @return {boolean} Whether the track is in TTML format.
 * @private
 */
bcplayer.CastPlayer.prototype.isTtmlTrack_ = function(track) {
  return this.isKnownTextTrack_(track,
      bcplayer.TextTrackType.SIDE_LOADED_TTML,
      bcplayer.CaptionsMimeType.TTML);
};


/**
 * Checks if a track is VTT.
 *
 * @param {cast.receiver.media.Track} track The track.
 * @return {boolean} Whether the track is in VTT format.
 * @private
 */
bcplayer.CastPlayer.prototype.isVttTrack_ = function(track) {
  return this.isKnownTextTrack_(track,
      bcplayer.TextTrackType.SIDE_LOADED_VTT,
      bcplayer.CaptionsMimeType.VTT);
};


/**
 * Checks if a track is of a known type by verifying the extension or mimeType.
 *
 * @param {cast.receiver.media.Track} track The track.
 * @param {!bcplayer.TextTrackType} textTrackType The text track
 *     type expected.
 * @param {!string} mimeType The mimeType expected.
 * @return {boolean} Whether the track has the specified format.
 * @private
 */
bcplayer.CastPlayer.prototype.isKnownTextTrack_ =
    function(track, textTrackType, mimeType) {
  if (!track) {
    return false;
  }
  // The bcplayer.TextTrackType values match the
  // file extensions required
  var fileExtension = textTrackType;
  var trackContentId = track.trackContentId;
  var trackContentType = track.trackContentType;
  if ((trackContentId &&
          bcplayer.getExtension_(trackContentId) === fileExtension) ||
      (trackContentType && trackContentType.indexOf(mimeType) === 0)) {
    return true;
  }
  return false;
};


/**
 * Processes embedded tracks, if they exist.
 *
 * @param {!Array.<number>} activeTrackIds The active tracks.
 * @private
 */
bcplayer.CastPlayer.prototype.processInBandTracks_ =
    function(activeTrackIds) {
  var protocol = this.player_.getStreamingProtocol();
  var streamCount = protocol.getStreamCount();
  for (var i = 0; i < streamCount; i++) {
    var trackId = i + 1;
    var isActive = false;
    for (var j = 0; j < activeTrackIds.length; j++) {
      if (activeTrackIds[j] == trackId) {
        isActive = true;
        break;
      }
    }
    var wasActive = protocol.isStreamEnabled(i);
    if (isActive && !wasActive) {
      protocol.enableStream(i, true);
    } else if (!isActive && wasActive) {
      protocol.enableStream(i, false);
    }
  }
};


/**
 * Reads in-band tracks info, if they exist.
 *
 * @return {cast.receiver.media.TracksInfo} The tracks info.
 * @private
 */
bcplayer.CastPlayer.prototype.readInBandTracksInfo_ = function() {
  var protocol = this.player_ ? this.player_.getStreamingProtocol() : null;
  if (!protocol) {
    return null;
  }
  var streamCount = protocol.getStreamCount();
  var activeTrackIds = [];
  var tracks = [];
  for (var i = 0; i < streamCount; i++) {
    var trackId = i + 1;
    if (protocol.isStreamEnabled(i)) {
      activeTrackIds.push(trackId);
    }
    var streamInfo = protocol.getStreamInfo(i);
    var mimeType = streamInfo.mimeType;
    var track;
    if (mimeType.indexOf(bcplayer.TrackType.TEXT) === 0 ||
        mimeType === bcplayer.CaptionsMimeType.TTML) {
      track = new cast.receiver.media.Track(
          trackId, cast.receiver.media.TrackType.TEXT);
    } else if (mimeType.indexOf(bcplayer.TrackType.VIDEO) === 0) {
      track = new cast.receiver.media.Track(
          trackId, cast.receiver.media.TrackType.VIDEO);
    } else if (mimeType.indexOf(bcplayer.TrackType.AUDIO) === 0) {
      track = new cast.receiver.media.Track(
          trackId, cast.receiver.media.TrackType.AUDIO);
    }
    if (track) {
      track.name = streamInfo.name;
      track.language = streamInfo.language;
      track.trackContentType = streamInfo.mimeType;
      tracks.push(track);
    }
  }
  if (tracks.length === 0) {
    return null;
  }
  var tracksInfo = /** @type {cast.receiver.media.TracksInfo} **/ ({
    tracks: tracks,
    activeTrackIds: activeTrackIds
  });
  return tracksInfo;
};


/**
 * Loads some media by delegating to default media manager.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load request info.
 * @private
 */
bcplayer.CastPlayer.prototype.loadDefault_ = function(info) {
  this.onLoadOrig_(new cast.receiver.MediaManager.Event(
      cast.receiver.MediaManager.EventType.LOAD,
      /** @type {!cast.receiver.MediaManager.RequestData} */ (info.message),
      info.senderId));
};


/**
 * Sets the amount of time before the player is considered idle.
 *
 * @param {number} t the time in milliseconds before the player goes idle
 * @private
 */
bcplayer.CastPlayer.prototype.setIdleTimeout_ = function(t) {
  this.log_('setIdleTimeout_: ' + t);
  var self = this;
  clearTimeout(this.idleTimerId_);
  if (t) {
    this.idleTimerId_ = setTimeout(function() {
      self.receiverManager_.stop();
    }, t);
  }
};


/**
 * Sets the type of player.
 *
 * @param {bcplayer.Type} type The type of player.
 * @param {boolean} isLiveStream whether player is showing live content
 * @private
 */
bcplayer.CastPlayer.prototype.setType_ = function(type, isLiveStream) {
  this.log_('setType_: ' + type);
  this.type_ = type;
  this.element_.setAttribute('type', type);
  this.element_.setAttribute('live', isLiveStream.toString());
  var overlay = this.getElementByClass_('.overlay');
  var watermark = this.getElementByClass_('.watermark');
  clearInterval(this.burnInPreventionIntervalId_);
  if (type != bcplayer.Type.AUDIO) {
    overlay.removeAttribute('style');
  } else {
    // if we are in 'audio' mode float metadata around the screen to
    // prevent screen burn
    this.burnInPreventionIntervalId_ = setInterval(function() {
      overlay.style.marginBottom = Math.round(Math.random() * 100) + 'px';
      overlay.style.marginLeft = Math.round(Math.random() * 600) + 'px';
    }, bcplayer.BURN_IN_TIMEOUT);
  }
};


/**
 * Sets the state of the player.
 *
 * @param {bcplayer.State} state the new state of the player
 * @param {boolean=} opt_crossfade true if should cross fade between states
 * @param {number=} opt_delay the amount of time (in ms) to wait
 * @private
 */
bcplayer.CastPlayer.prototype.setState_ = function(
    state, opt_crossfade, opt_delay) {
  this.log_('setState_: state=' + state + ', crossfade=' + opt_crossfade +
      ', delay=' + opt_delay);
  var self = this;
  self.lastStateTransitionTime_ = Date.now();
  clearTimeout(self.delay_);
  if (opt_delay) {
    var func = function() { self.setState_(state, opt_crossfade); };
    self.delay_ = setTimeout(func, opt_delay);
  } else {
    if (!opt_crossfade) {
      self.state_ = state;
      self.element_.setAttribute('state', state);
      self.updateApplicationState_();
      self.setIdleTimeout_(bcplayer.IDLE_TIMEOUT[state.toUpperCase()]);
    } else {
      var stateTransitionTime = self.lastStateTransitionTime_;
      bcplayer.transition_(self.element_, bcplayer.TRANSITION_DURATION_,
          function() {
            // In the case of a crossfade transition, the transition will be completed
            // even if setState is called during the transition.  We need to be sure
            // that the requested state is ignored as the latest setState call should
            // take precedence.
            if (stateTransitionTime < self.lastStateTransitionTime_) {
              self.log_('discarded obsolete deferred state(' + state + ').');
              return;
            }
            self.setState_(state, false);
          });
    }
  }
};


/**
 * Updates the application state if it has changed.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.updateApplicationState_ = function() {
  this.log_('updateApplicationState_');
  if (this.mediaManager_) {
    var idle = this.state_ === bcplayer.State.IDLE;
    var media = idle ? null : this.mediaManager_.getMediaInformation();
    var applicationState = bcplayer.getApplicationState_(media);
    if (this.currentApplicationState_ != applicationState) {
      this.currentApplicationState_ = applicationState;
      this.receiverManager_.setApplicationState(applicationState);
    }
    if(this.state_){
      constantUpdate("State", [this.state_]);
    }
  }
};


/**
 * Called when the player is ready. We initialize the UI for the launching
 * and idle screens.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onReady_ = function() {
  this.log_('onReady');
  this.setState_(bcplayer.State.IDLE, false);
};

bcplayer.CastPlayer.prototype.onSenderConnected_ = function(event) {
  //Sending 'connected' event to external server to generate analytics data
  var updateData = ["Cast Session started"];
  constantUpdate("Connected", updateData);
};


/**
 * Called when a sender disconnects from the app.
 *
 * @param {cast.receiver.CastReceiverManager.SenderDisconnectedEvent} event
 * @private
 */
bcplayer.CastPlayer.prototype.onSenderDisconnected_ = function(event) {
  //Data Track
  //When disconnected, sends the data to the respective recipients
  //Sending 'connected' event to external server to generate analytics data
  try {
    var updateData = ["Cast Session ended"];
    constantUpdate("Disconnected", updateData);
    //Send all the data via ajax to final destination/processing server
    function encodeURIComponentWithDots(url) {
      var newUrl = encodeURIComponent(url);
      newUrl = newUrl.split('.').join('%2E');
      return newUrl;
    }
    if(finalDataServer){
      if (this.receiverManager_.getSenders().length === 0 && event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
        var keys = Object.keys(this.videoStatsData_);
        for(var i = 0; i<keys.length; i++){
          var value = this.videoStatsData_[keys[i]];
          var encoded = encodeURIComponentWithDots(keys[i]);
          this.videoStatsData_[encoded] = value;
          delete this.videoStatsData_[keys[i]];
        }
        sendAjaxData(this.videoStatsData_, finalDataServer);
    }
  }
    } 
    catch(err) {
      console.log('VideoStats data error');
  }
  //this.log_ the disconnect message
  this.log_('onSenderDisconnected');

  // When the last or only sender is connected to a receiver,
  // tapping Disconnect stops the app running on the receiver.
  if (this.receiverManager_.getSenders().length === 0 &&
      event.reason ===
          cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
    this.receiverManager_.stop();
  }
};


/**
 * Called when media has an error. Transitions to IDLE state and
 * calls to the original media manager implementation.
 *
 * @see cast.receiver.MediaManager#onError
 * @param {!Object} error
 * @private
 */
bcplayer.CastPlayer.prototype.onError_ = function(error) {
  this.log_('onError');
  this.log_('Player Error: check YOUR-CHROMECAST-IP:9222 for full disclosure');
  var self = this;
  bcplayer.transition_(self.element_, bcplayer.TRANSITION_DURATION_,
      function() {
        self.setState_(bcplayer.State.IDLE, true);
        self.onErrorOrig_(error);
      });
};

/**
 * Called when media is buffering. If we were previously playing,
 * transition to the BUFFERING state.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onBuffering_ = function() {
  this.log_('onBuffering[readyState=' + this.mediaElement_.readyState + ']');
  if (this.state_ === bcplayer.State.PLAYING &&
      this.mediaElement_.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
    this.setState_(bcplayer.State.BUFFERING, false);
  }
};


/**
 * Called when media has started playing. We transition to the
 * PLAYING state.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onPlaying_ = function() {
  //Data Tracker - Start the data dictionary
  /*Check if this video was watched. If not, create an element on the associative
   array that carries its data*/
  try {
      var media = this.mediaManager_.getMediaInformation();
      if(this.listOfVideosWatched_.indexOf(media.contentId) == -1){
        if(media.metadata != undefined){
          this.videoStatsData_[media.contentId] = {"title": media.metadata.title, "duration": this.mediaElement_.duration, "secondsSeen": [], "secondsPaused": [], "secondsRestart": [], "secondsVolumeChanged": [], "Views": 0};
        }else{
          this.videoStatsData_[media.contentId] = {"title": "Untitled", "duration": this.mediaElement_.duration, "secondsSeen": [], "secondsPaused": [], "secondsRestart": [], "secondsVolumeChanged": [], "Views": 0};
        }
        this.timeArray_[media.contentId] = [];
        this.secondsSeen_[media.contentId] = [];
        this.secondsPaused_[media.contentId] = [];
        this.secondsRestart_[media.contentId] = [];
        this.secondsVolumeChanged_[media.contentId] = [];
        this.lastMilestone_[media.contentId] = 0;
        this.listOfVideosWatched_.push(media.contentId);
      }
      
      //Get and send data
      //Adds a restart event timestamp for the current video
      var restartSecondInt = parseInt(this.mediaElement_.currentTime);
      this.addSecond(this.secondsRestart_[media.contentId], restartSecondInt)
      this.videoStatsData_[media.contentId]["secondsRestart"] = this.secondsRestart_[media.contentId];
      
      //Sending restart/start event to external server to generate analytics data
      var updateData = [media.contentId, this.title_, this.mediaElement_.currentTime];
      constantUpdate("Start/Restart", updateData);
    } 
    catch(err) {
      console.log('Playing data error');
  }
  
  //Finally call the playing state functions
  this.log_('onPlaying');
  this.cancelDeferredPlay_('media is already playing');
  var isAudio = this.type_ == bcplayer.Type.AUDIO;
  var isLoading = this.state_ == bcplayer.State.LOADING;
  var crossfade = isLoading && !isAudio;
  this.setState_(bcplayer.State.PLAYING, crossfade);
};


/**
 * Called when media has been paused. If this is an auto-pause as a result of
 * buffer underflow, we transition to BUFFERING state; otherwise, if the media
 * isn't done, we transition to the PAUSED state.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onPause_ = function() {
  //Start data tracker for pause event
  //Adds a restart event timestamp for the current video
  try {
      var media = this.mediaManager_.getMediaInformation();
      var pauseSecondInt = parseInt(this.mediaElement_.currentTime);
      this.addSecond(this.secondsPaused_[media.contentId], pauseSecondInt);
      this.videoStatsData_[media.contentId]["secondsPaused"] = this.secondsPaused_[media.contentId];
      
      //Sending paused event to external server to generate analytics data
      var updateData = [media.contentId, this.title_, this.mediaElement_.currentTime];
      constantUpdate("Paused", updateData);
    } 
    catch(err) {
      console.log('Pause data error');
  }
  
  //Pause functions
  this.log_('onPause');
  this.cancelDeferredPlay_('media is paused');
  var isIdle = this.state_ === bcplayer.State.IDLE;
  var isDone = this.mediaElement_.currentTime === this.mediaElement_.duration;
  var isUnderflow = this.player_ && this.player_.getState()['underflow'];
  if (isUnderflow) {
    this.log_('isUnderflow');
    this.setState_(bcplayer.State.BUFFERING, false);
    this.mediaManager_.broadcastStatus(/* includeMedia */ false);
  } else if (!isIdle && !isDone) {
    this.setState_(bcplayer.State.PAUSED, false);
  }
  this.updateProgress_();
};

/**
 * Called when the system volume is changed.
 *
 * @private
 */

bcplayer.CastPlayer.prototype.onSystemVolumeChanged_ = function(event) {
  //Start data tracker for volume changed event
  //Sending 'volume' event to external server to generate analytics data
  var media = this.mediaManager_.getMediaInformation();
  if(media){
    var updateData = [media.contentId, this.title_, this.mediaElement_.currentTime];
  } else{
    var updateData = [this.title_, this.mediaElement_.currentTime];
  }
  constantUpdate("VolumeChanged", updateData);

  //Adds a 'volume' event timestamp for the current video
  var pauseSecondInt = parseInt(this.mediaElement_.currentTime);
  if(media){
    this.addSecond(this.secondsVolumeChanged_[media.contentId], pauseSecondInt);
    this.videoStatsData_[media.contentId]["secondsVolumeChanged"] = this.secondsVolumeChanged_[media.contentId];
  }
};

/**
 * Changes player state reported to sender, if necessary.
 * @param {!cast.receiver.media.MediaStatus} mediaStatus Media status that is
 *     supposed to go to sender.
 * @return {cast.receiver.media.MediaStatus} MediaStatus that will be sent to
 *     sender.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.customizedStatusCallback_ = function(
    mediaStatus) {
  this.log_('customizedStatusCallback_: playerState=' +
      mediaStatus.playerState + ', this.state_=' + this.state_);
  // TODO: remove this workaround once MediaManager detects buffering
  // immediately.
  if (mediaStatus.playerState === cast.receiver.media.PlayerState.PAUSED &&
      this.state_ === bcplayer.State.BUFFERING) {
    mediaStatus.playerState = cast.receiver.media.PlayerState.BUFFERING;
  }
  return mediaStatus;
};


/**
 * Called when we receive a STOP message. We stop the media and transition
 * to the IDLE state.
 *
 * @param {cast.receiver.MediaManager.Event} event The stop event.
 * @private
 */
bcplayer.CastPlayer.prototype.onStop_ = function(event) {
  this.log_('onStop');
  this.cancelDeferredPlay_('media is stopped');
  var self = this;
  bcplayer.transition_(self.element_, bcplayer.TRANSITION_DURATION_,
      function() {
        self.setState_(bcplayer.State.IDLE, false);
        self.onStopOrig_(event);
      });
};


/**
 * Called when media has ended. We transition to the IDLE state.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onEnded_ = function() {
  //test functions
  try {
      if(this.currentQueueItemId_ && this.currentQueue_){
        var index = this.currentQueue_.indexOf(this.currentQueueItemId_);
        this.currentQueueItemId_ = this.currentQueue_[index + 1];
      }

      var media = this.mediaManager_.getMediaInformation();
      var updateData = [media.contentId, this.title_, this.mediaElement_.currentTime];
      constantUpdate("Ended", updateData);
    } 
    catch(err) {
      console.log('Ended data error');
  }

  this.log_('onEnded');
  this.setState_(bcplayer.State.IDLE, true);
  this.hidePreviewMode_();
};


/**
 * Called when media has been aborted. We transition to the IDLE state.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onAbort_ = function() {
  this.log_('onAbort');
  this.setState_(bcplayer.State.IDLE, true);
  this.hidePreviewMode_();
};


/**
 * Called periodically during playback, to notify changes in playback position.
 * We transition to PLAYING state, if we were in BUFFERING or LOADING state.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onProgress_ = function() {
  // if we were previously buffering, update state to playing
  if (this.state_ === bcplayer.State.BUFFERING ||
      this.state_ === bcplayer.State.LOADING) {
    this.setState_(bcplayer.State.PLAYING, false);
  }
  this.updateProgress_();
};


/**
 * Updates the current time and progress bar elements.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.updateProgress_ = function() {
  // Update the time and the progress bar
  if (!bcplayer.isCastForAudioDevice_()) {
    var curTime = this.mediaElement_.currentTime;
    var totalTime = this.mediaElement_.duration;
    if (!isNaN(curTime) && !isNaN(totalTime)) {
      var pct = 100 * (curTime / totalTime);
      $('.controls-cur-time').text(bcplayer.formatDuration_(curTime));
      $('.controls-total-time').text(bcplayer.formatDuration_(totalTime));
      $('.controls-progress-inner').css("width", String(pct) + "%");
      $('.controls-progress-thumb').css("left", String(pct) + "%");
      
      //Keep the data tracker information for time values
      try {
          constantUpdate("Time", [pct]);
          var pctInt = parseInt(pct);
          var curTimeInt = parseInt(curTime);
          
          //Adds a "seen" event timestamp for the current video
          var media = this.mediaManager_.getMediaInformation();
          this.timeArray_[media.contentId] = this.getArrayOfIntervals_(this.timeInterval_, this.mediaElement_.duration);
          //Division by time of the video watched    
          if(this.timeArray_[media.contentId].indexOf(curTimeInt)>-1){
            var index = this.timeArray_[media.contentId].indexOf(curTimeInt);
            this.lastSecond_ = this.timeArray_[media.contentId][index];
            this.addSecond(this.secondsSeen_[media.contentId], this.lastSecond_);
            this.videoStatsData_[media.contentId]["secondsSeen"] = this.secondsSeen_[media.contentId];
            this.timeArray_[media.contentId].splice(index, 1);
          }
      
          //Sending milestone to external server to generate analytics data
          var check = this.checkMilestone(this.secondsSeen_[media.contentId], this.mediaElement_.duration, this.lastMilestone_[media.contentId]);
          if(this.lastMilestone_[media.contentId] != check){
            this.lastMilestone_[media.contentId] = check;
            //send the message
            var updateData = [media.contentId, this.title_, this.lastMilestone_[media.contentId]];
            constantUpdate("Milestone", updateData);
          }
      } 
        catch(err) {
          console.log('Update progress data error');
      }
      
      //Change the title with the percentage watched
      var titleElement = this.element_.querySelector('.media-title');
      var percentage = String(' (' + pctInt + '%)');
      if(this.title_ != undefined && this.title_ != 'undefined'){
        var title = this.title_ + percentage;
      } else{
        var title = '';
      }
      bcplayer.setInnerText_(titleElement, title);
      
      // Handle preview mode
      if (this.displayPreviewMode_) {
        var timeLeft = totalTime-curTime;
        $('.preview-mode-artwork').height($('.preview-mode-artwork').width());
        $('.preview-mode-timer-starts').css('display', 'block');
        $('.preview-mode-timer-sec').css('display', 'block');
        this.previewModeTimerElement_.innerText = "" + Math.round(totalTime-curTime);  
      }
    }
  }
};


/**
 * Callback called when user starts seeking
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onSeekStart_ = function() {
  this.log_('onSeekStart');
  clearTimeout(this.seekingTimeoutId_);
  this.element_.classList.add('seeking');
};


/**
 * Callback called when user stops seeking.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onSeekEnd_ = function() {
  this.log_('onSeekEnd');
  clearTimeout(this.seekingTimeoutId_);
  this.seekingTimeoutId_ = bcplayer.addClassWithTimeout_(this.element_,
      'seeking', 3000);
};


/**
 * Called when the player is added/removed from the screen because HDMI
 * input has changed. If we were playing but no longer visible, pause
 * the currently playing media.
 *
 * @see cast.receiver.CastReceiverManager#onVisibilityChanged
 * @param {!cast.receiver.CastReceiverManager.VisibilityChangedEvent} event
 *    Event fired when visibility of application is changed.
 * @private
 */
bcplayer.CastPlayer.prototype.onVisibilityChanged_ = function(event) {
  this.log_('onVisibilityChanged');
  if (!event.isVisible) {
    this.mediaElement_.pause();
    this.mediaManager_.broadcastStatus(false);
  }
};


/**
 * Called when we receive a PRELOAD message.
 *
 * @see castplayer.CastPlayer#load
 * @param {cast.receiver.MediaManager.Event} event The load event.
 * @return {boolean} Whether the item can be preloaded.
 * @private
 */
bcplayer.CastPlayer.prototype.onPreload_ = function(event) {
  this.log_('onPreload_');
  var loadRequestData =
      /** @type {!cast.receiver.MediaManager.LoadRequestData} */ (event.data);
  return this.preload(loadRequestData.media);
};


/**
 * Called when we receive a CANCEL_PRELOAD message.
 *
 * @see castplayer.CastPlayer#load
 * @param {cast.receiver.MediaManager.Event} event The load event.
 * @return {boolean} Whether the item can be preloaded.
 * @private
 */
bcplayer.CastPlayer.prototype.onCancelPreload_ = function(event) {
  this.log_('onCancelPreload_');
  this.hidePreviewMode_();
  return true;
};

/**
 * Called when we receive a QUEUE_LOAD message.
 *
 * @param {cast.receiver.MediaManager.Event} event The queue load event.
 * @private
 */
bcplayer.CastPlayer.prototype.onQueueLoad_ = function(event) {
  this.log_('onQueueLoad_');
  this.log_('A queue was loaded');
  try {
    var items = event.data.items;
    this.currentQueue_ = [];
    this.playlist_ = {};
    for(var i=0; i<items.length; i++){
     this.currentQueue_.push(items[i].itemId);
     var media = items[i].media;
     var preloadTime = items[i].preloadTime;
     var info = {'media': media, 'preload': preloadTime};
     this.playlist_[items[i].itemId] = info;
    }
    this.currentQueueItemId_ = items[0].itemId;
  } 
  catch(err) {
    this.currentQueue_ = null;
    this.currentQueueItemId_ = null;
    this.playlist_ = null;
    this.log_("Queue error - load");
  }
  this.onQueueLoadOrig_(event);
};
/**
 * Called when we receive a QUEUE_INSERT message.
 *
 * @param {cast.receiver.MediaManager.Event} event The queue insert event.
 * @private
 */
bcplayer.CastPlayer.prototype.onQueueInsert_ = function(event) {
  this.log_('onQueueInsert_');
  this.log_('Queue: An item was inserted');
  try {
    if(!this.currentQueue_){
      this.currentQueue_ = [];
    }
    if(!this.playlist_){
      this.playlist_ = {};
    }
    var data = event.data;
    var items = event.data.items;
    if(data.insertBefore != undefined){
      var index = this.currentQueue_.indexOf(data.insertBefore);
      var playingNow = this.currentQueue_.indexOf(this.currentQueueItemId_);
      this.log_(index);
      this.log_(playingNow);
      if(index != playingNow){
        for(var i=items.length - 1; i>=0; i--){
        this.currentQueue_.splice(index, 0, items[i].itemId);
        var media = items[i].media;
        var preloadTime = items[i].preloadTime;
        var info = {'media': media, 'preload': preloadTime};
        this.playlist_[items[i].itemId] = info;
        }
        this.showPlaylist_(items[0].itemId, "Inserted");
      } else{
        for(var i=items.length - 1; i>=0; i--){
        this.currentQueue_.splice(index, 0, items[i].itemId);
        var media = items[i].media;
        var preloadTime = items[i].preloadTime;
        var info = {'media': media, 'preload': preloadTime};
        this.playlist_[items[i].itemId] = info;
        }
      }
    } else{
      for(var i=0; i<items.length; i++){
        this.currentQueue_.push(items[i].itemId);
        var media = items[i].media;
        var preloadTime = items[i].preloadTime;
        var info = {'media': media, 'preload': preloadTime};
        this.playlist_[items[i].itemId] = info;
      }
      this.showPlaylist_(items[0].itemId, "Inserted");
    }
  }
  catch(err) {
    this.currentQueue_ = null;
    this.currentQueueItemId_ = null;
    this.playlist_ = null;
    this.log_("Queue error - insert");
  }
  this.onQueueInsertOrig_(event);
};
/**
 * Called when we receive a QUEUE_REMOVE message.
 *
 * @param {cast.receiver.MediaManager.Event} event The queue remove event.
 * @private
 */

bcplayer.CastPlayer.prototype.onQueueRemove_ = function(event) {
  this.log_('onQueueRemove_');
  this.log_('Queue: An item was removed');
  try{
    var ids = event.data.itemIds;
    if(ids[i] != this.currentQueueItemId_){
     this.showPlaylist_(ids[0], "Removed");
    }
    for(var i=0; i<ids.length; i++){
      var index = this.currentQueue_.indexOf(ids[i]);
      if(ids[i] == this.currentQueueItemId_){
        if((index + 1)<this.currentQueue_.length){
          this.currentQueueItemId_ = this.currentQueue_[index + 1];
        }else{
           this.currentQueueItemId_ = null;
        }
      }
      this.currentQueue_.splice(index, 1);
      delete this.playlist_[ids[i]];
    }
  }
  catch(err) {
    this.currentQueue_ = null;
    this.currentQueueItemId_ = null;
    this.playlist_ = null;
    this.log_("Queue error - remove");
  }
  this.onQueueRemoveOrig_(event);
};
/**
 * Called when we receive a QUEUE_UPDATE message.
 *
 * @param {cast.receiver.MediaManager.Event} event The queue update event.
 * @private
 */
bcplayer.CastPlayer.prototype.onQueueUpdate_ = function(event) {
  this.log_('onQueueUpdate_');
  this.log_('The queue was udpated');
  try{
    if(event.data.currentItemId != undefined){
      this.currentQueueItemId_ = event.data.currentItemId;
    } else{
      var index = this.currentQueue_.indexOf(this.currentQueueItemId_);
      this.currentQueueItemId_ = this.currentQueue_[index - 1];
    }
  }
  catch(err) {
    this.currentQueue_ = null;
    this.currentQueueItemId_ = null;
    this.playlist_ = null;
    this.log_("Queue error - update");
  }
  this.onQueueUpdateOrig_(event);
};
/**
 * Called when we receive a QUEUE_REORDER message.
 *
 * @param {cast.receiver.MediaManager.Event} event The queue reorder event.
 * @private
 */
bcplayer.CastPlayer.prototype.onQueueReorder_ = function(event) {
  this.log_('onQueueReorder_');
  this.log_('The queue was reordered');
  try{
    var currentIndex = this.currentQueue_.indexOf(event.data.itemIds[0]);
    this.currentQueue_.splice(currentIndex, 1);
    var newIndex = this.currentQueue_.indexOf(event.data.insertBefore);
    this.currentQueue_.splice(newIndex, 0, event.data.itemIds[0]);
  }
  catch(err) {
    this.currentQueue_ = null;
    this.currentQueueItemId_ = null;
    this.playlist_ = null;
    this.log_("Queue error - reorder");
  }
  this.onQueueReorderOrig_(event);
};
/**
 * Called when we receive a QUEUE_ENDED message.
 *
 * @param {cast.receiver.MediaManager.Event} event The queue ended event.
 * @private
 */
bcplayer.CastPlayer.prototype.onQueueEnded_ = function(event) {
  this.log_('onQueueEnded_');
  this.log_('The queue was ended');
  this.currentQueue_ = null;
  this.currentQueueItemId_ = null;
  this.playlist_ = null;
  this.onQueueEndedOrig_(event);
};


/**
 * Called when we receive a LOAD message. Calls load().
 *
 * @see bcplayer#load
 * @param {cast.receiver.MediaManager.Event} event The load event.
 * @private
 */
bcplayer.CastPlayer.prototype.onLoad_ = function(event) {
  this.log_('onLoad_');
  this.cancelDeferredPlay_('new media is loaded');
  this.load(new cast.receiver.MediaManager.LoadInfo(
      /** @type {!cast.receiver.MediaManager.LoadRequestData} */ (event.data),
      event.senderId));
};


/**
 * Called when we receive a EDIT_TRACKS_INFO message.
 *
 * @param {!cast.receiver.MediaManager.Event} event The editTracksInfo event.
 * @private
 */
bcplayer.CastPlayer.prototype.onEditTracksInfo_ = function(event) {
  this.log_('onEditTracksInfo');
  this.onEditTracksInfoOrig_(event);

  // If the captions are embedded or ttml we need to enable/disable tracks
  // as needed (vtt is processed by the media manager)
  if (!event.data || !event.data.activeTrackIds || !this.textTrackType_) {
    return;
  }
  var mediaInformation = this.mediaManager_.getMediaInformation() || {};
  var type = this.textTrackType_;
  if (type == bcplayer.TextTrackType.SIDE_LOADED_TTML) {
    // The player_ may not have been created yet if the type of media did
    // not require MPL. It will be lazily created in processTtmlCues_
    if (this.player_) {
      this.player_.enableCaptions(false, cast.player.api.CaptionsType.TTML);
    }
    this.processTtmlCues_(event.data.activeTrackIds,
        mediaInformation.tracks || []);
  } else if (type == bcplayer.TextTrackType.EMBEDDED) {
    this.player_.enableCaptions(false);
    this.processInBandTracks_(event.data.activeTrackIds);
    this.player_.enableCaptions(true);
  }
};


/**
 * Called when metadata is loaded, at this point we have the tracks information
 * if we need to provision embedded captions.
 *
 * @param {!cast.receiver.MediaManager.LoadInfo} info The load information.
 * @private
 */
bcplayer.CastPlayer.prototype.onMetadataLoaded_ = function(info) {
  this.log_('onMetadataLoaded');
  this.onLoadSuccess_();
  // In the case of ttml and embedded captions we need to load the cues using
  // MPL.
  this.readSideLoadedTextTrackType_(info);

  if (this.textTrackType_ ==
      bcplayer.TextTrackType.SIDE_LOADED_TTML &&
      info.message && info.message.activeTrackIds && info.message.media &&
      info.message.media.tracks) {
    this.processTtmlCues_(
        info.message.activeTrackIds, info.message.media.tracks);
  } else if (!this.textTrackType_) {
    // If we do not have a textTrackType, check if the tracks are embedded
    this.maybeLoadEmbeddedTracksMetadata_(info);
  }
  // Only send load completed when we have completed the player LOADING state
  this.metadataLoaded_ = true;
  this.maybeSendLoadCompleted_(info);
};


/**
 * Called when the media could not be successfully loaded. Transitions to
 * IDLE state and calls the original media manager implementation.
 *
 * @see cast.receiver.MediaManager#onLoadMetadataError
 * @param {!cast.receiver.MediaManager.LoadInfo} event The data
 *     associated with a LOAD event.
 * @private
 */
bcplayer.CastPlayer.prototype.onLoadMetadataError_ = function(event) {
  this.log_('onLoadMetadataError_');
  this.log_("Error: "+event.data);
  var self = this;
  bcplayer.transition_(self.element_, bcplayer.TRANSITION_DURATION_,
      function() {
        self.setState_(bcplayer.State.IDLE, true);
        self.onLoadMetadataErrorOrig_(event);
      });
};


/**
 * Cancels deferred playback.
 *
 * @param {string} cancelReason
 * @private
 */
bcplayer.CastPlayer.prototype.cancelDeferredPlay_ = function(cancelReason) {
  if (this.deferredPlayCallbackId_) {
    this.log_('Cancelled deferred playback: ' + cancelReason);
    clearTimeout(this.deferredPlayCallbackId_);
    this.deferredPlayCallbackId_ = null;
  }
};


/**
 * Defers playback start by given timeout.
 *
 * @param {number} timeout In msec.
 * @private
 */
bcplayer.CastPlayer.prototype.deferPlay_ = function(timeout) {
  this.log_('Defering playback for ' + timeout + ' ms');
  var self = this;
  this.deferredPlayCallbackId_ = setTimeout(function() {
    self.deferredPlayCallbackId_ = null;
    if (self.player_) {
      self.log_('Playing when enough data');
      self.player_.playWhenHaveEnoughData();
    } else {
      self.log_('Playing');
      self.mediaElement_.play();
    }
  }, timeout);
};


/**
 * Called when the media is successfully loaded. Updates the progress bar.
 *
 * @private
 */
bcplayer.CastPlayer.prototype.onLoadSuccess_ = function() {
  this.log_('onLoadSuccess');
  // we should have total time at this point, so update the label
  // and progress bar
  var totalTime = this.mediaElement_.duration;
  if (!isNaN(totalTime)) {
    this.totalTimeElement_.textContent =
        bcplayer.formatDuration_(totalTime);
  } else {
    this.totalTimeElement_.textContent = '';
    this.progressBarInnerElement_.style.width = '100%';
    this.progressBarThumbElement_.style.left = '100%';
  }
};


/**
 * Returns the image url for the given media object.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media.
 * @return {string|undefined} The image url.
 * @private
 */
bcplayer.getMediaImageUrl_ = function(media) {
  var metadata = media.metadata || {};
  var images = metadata['images'] || [];
  return images && images[0] && images[0]['url'];
};


/**
 * Gets the adaptive streaming protocol creation function based on the media
 * information.
 *
 * @param {!cast.receiver.media.MediaInformation} mediaInformation The
 *     asset media information.
 * @return {?function(cast.player.api.Host):player.StreamingProtocol}
 *     The protocol function that corresponds to this media type.
 * @private
 */
bcplayer.getProtocolFunction_ = function(mediaInformation) {
  var url = mediaInformation.contentId;
  var type = mediaInformation.contentType || '';
  var path = bcplayer.getPath_(url) || '';
  if (bcplayer.getExtension_(path) === 'm3u8' ||
          type === 'application/x-mpegurl' ||
          type === 'application/vnd.apple.mpegurl') {
    return cast.player.api.CreateHlsStreamingProtocol;
  } else if (bcplayer.getExtension_(path) === 'mpd' ||
          type === 'application/dash+xml') {
    return cast.player.api.CreateDashStreamingProtocol;
  } else if (path.indexOf('.ism') > -1 ||
          type === 'application/vnd.ms-sstr+xml') {
    return cast.player.api.CreateSmoothStreamingProtocol;
  }
  return null;
};


/**
 * Returns true if the media can be preloaded.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media information.
 * @return {boolean} whether the media can be preloaded.
 * @private
 */
bcplayer.supportsPreload_ = function(media) {
  return bcplayer.getProtocolFunction_(media) != null;
};


/**
 * Returns true if the preview UI should be shown for the type of media
 * although the media can not be preloaded.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media information.
 * @return {boolean} whether the media can be previewed.
 * @private
 */
bcplayer.canDisplayPreview_ = function(media) {
  var contentId = media.contentId || '';
  var contentUrlPath = bcplayer.getPath_(contentId);
  if (bcplayer.getExtension_(contentUrlPath) === 'mp4') {
    return true;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'ogv') {
    return true;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'webm') {
    return true;
  }
  return false;
};


/**
 * Returns the type of player to use for the given media.
 * By default this looks at the media's content type, but falls back
 * to file extension if not set.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media.
 * @return {bcplayer.Type} The player type.
 * @private
 */
bcplayer.getType_ = function(media) {
  var contentId = media.contentId || '';
  var contentType = media.contentType || '';
  var contentUrlPath = bcplayer.getPath_(contentId);
  if (contentType.indexOf('audio/') === 0) {
    return bcplayer.Type.AUDIO;
  } else if (contentType.indexOf('video/') === 0) {
    return bcplayer.Type.VIDEO;
  } else if (contentType.indexOf('application/x-mpegurl') === 0) {
    return bcplayer.Type.VIDEO;
  } else if (contentType.indexOf('application/vnd.apple.mpegurl') === 0) {
    return bcplayer.Type.VIDEO;
  } else if (contentType.indexOf('application/dash+xml') === 0) {
    return bcplayer.Type.VIDEO;
  } else if (contentType.indexOf('application/vnd.ms-sstr+xml') === 0) {
    return bcplayer.Type.VIDEO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'mp3') {
    return bcplayer.Type.AUDIO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'oga') {
    return bcplayer.Type.AUDIO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'wav') {
    return bcplayer.Type.AUDIO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'mp4') {
    return bcplayer.Type.VIDEO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'ogv') {
    return bcplayer.Type.VIDEO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'webm') {
    return bcplayer.Type.VIDEO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'm3u8') {
    return bcplayer.Type.VIDEO;
  } else if (bcplayer.getExtension_(contentUrlPath) === 'mpd') {
    return bcplayer.Type.VIDEO;
  } else if (contentType.indexOf('.ism') != 0) {
    return bcplayer.Type.VIDEO;
  }
  return bcplayer.Type.UNKNOWN;
};


/**
 * Formats the given duration.
 *
 * @param {number} dur the duration (in seconds)
 * @return {string} the time (in HH:MM:SS)
 * @private
 */
bcplayer.formatDuration_ = function(dur) {
  dur = Math.floor(dur);
  function digit(n) { return ('00' + Math.round(n)).slice(-2); }
  var hr = Math.floor(dur / 3600);
  var min = Math.floor(dur / 60) % 60;
  var sec = dur % 60;
  if (!hr) {
    return digit(min) + ':' + digit(sec);
  } else {
    return digit(hr) + ':' + digit(min) + ':' + digit(sec);
  }
};


/**
 * Adds the given className to the given element for the specified amount of
 * time.
 *
 * @param {!Element} element The element to add the given class.
 * @param {string} className The class name to add to the given element.
 * @param {number} timeout The amount of time (in ms) the class should be
 *     added to the given element.
 * @return {number} A numerical id, which can be used later with
 *     window.clearTimeout().
 * @private
 */
bcplayer.addClassWithTimeout_ = function(element, className, timeout) {
  element.classList.add(className);
  return setTimeout(function() {
    element.classList.remove(className);
  }, timeout);
};


/**
 * Causes the given element to fade out, does something, and then fades
 * it back in.
 *
 * @param {!Element} element The element to fade in/out.
 * @param {number} time The total amount of time (in seconds) to transition.
 * @param {function()} something The function that does something.
 * @private
 */
bcplayer.transition_ = function(element, time, something) {
  if (time <= 0 || bcplayer.isCastForAudioDevice_()) {
    // No transitions supported for Cast for Audio devices
    something();
  } else {
    bcplayer.fadeOut_(element, time / 2.0, function() {
      something();
      bcplayer.fadeIn_(element, time / 2.0);
    });
  }
};


/**
 * Preloads media data that can be preloaded.
 *
 * @param {!cast.receiver.media.MediaInformation} media The media to load.
 * @param {function()} doneFunc The function to call when done.
 * @private
 */
bcplayer.preload_ = function(media, doneFunc) {
  if (bcplayer.isCastForAudioDevice_()) {
    // No preloading for Cast for Audio devices
    doneFunc();
    return;
  }

  var imagesToPreload = [];
  var counter = 0;
  var images = [];
  function imageLoaded() {
      if (++counter === imagesToPreload.length) {
        doneFunc();
      }
  }

  // try to preload image metadata
  var thumbnailUrl = bcplayer.getMediaImageUrl_(media);
  if (thumbnailUrl) {
    imagesToPreload.push(thumbnailUrl);
  }
  if (imagesToPreload.length === 0) {
    doneFunc();
  } else {
    for (var i = 0; i < imagesToPreload.length; i++) {
      images[i] = new Image();
      images[i].src = imagesToPreload[i];
      images[i].onload = function() {
        imageLoaded();
      };
      images[i].onerror = function() {
        imageLoaded();
      };
    }
  }
};


/**
 * Causes the given element to fade in.
 *
 * @param {!Element} element The element to fade in.
 * @param {number} time The amount of time (in seconds) to transition.
 * @param {function()=} opt_doneFunc The function to call when complete.
 * @private
 */
bcplayer.fadeIn_ = function(element, time, opt_doneFunc) {
  bcplayer.fadeTo_(element, '', time, opt_doneFunc);
};


/**
 * Causes the given element to fade out.
 *
 * @param {!Element} element The element to fade out.
 * @param {number} time The amount of time (in seconds) to transition.
 * @param {function()=} opt_doneFunc The function to call when complete.
 * @private
 */
bcplayer.fadeOut_ = function(element, time, opt_doneFunc) {
  bcplayer.fadeTo_(element, 0, time, opt_doneFunc);
};


/**
 * Causes the given element to fade to the given opacity in the given
 * amount of time.
 *
 * @param {!Element} element The element to fade in/out.
 * @param {string|number} opacity The opacity to transition to.
 * @param {number} time The amount of time (in seconds) to transition.
 * @param {function()=} opt_doneFunc The function to call when complete.
 * @private
 */
bcplayer.fadeTo_ = function(element, opacity, time, opt_doneFunc) {
  var self = this;
  var id = Date.now();
  var listener = function() {
    element.style.webkitTransition = '';
    element.removeEventListener('webkitTransitionEnd', listener, false);
    if (opt_doneFunc) {
      opt_doneFunc();
    }
  };
  element.addEventListener('webkitTransitionEnd', listener, false);
  element.style.webkitTransition = 'opacity ' + time + 's';
  element.style.opacity = opacity;
};


/**
 * Utility function to get the extension of a URL file path.
 *
 * @param {string} url the URL
 * @return {string} the extension or "" if none
 * @private
 */
bcplayer.getExtension_ = function(url) {
  var parts = url.split('.');
  // Handle files with no extensions and hidden files with no extension
  if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
    return '';
  }
  return parts.pop().toLowerCase();
};


/**
 * Returns the application state.
 *
 * @param {cast.receiver.media.MediaInformation=} opt_media The current media
 *     metadata
 * @return {string} The application state.
 * @private
 */
bcplayer.getApplicationState_ = function(opt_media) {
  if (opt_media && opt_media.metadata && opt_media.metadata.title) {
    return 'Now Casting: ' + opt_media.metadata.title;
  } else if (opt_media) {
    return 'Now Casting';
  } else {
    return 'Ready To Cast';
  }
};


/**
 * Returns the URL path.
 *
 * @param {string} url The URL
 * @return {string} The URL path.
 * @private
 */
bcplayer.getPath_ = function(url) {
  var href = document.createElement('a');
  href.href = url;
  return href.pathname || '';
};


/**
 * Logging utility.
 *
 * @param {string} message to log
 * @private
 */
bcplayer.CastPlayer.prototype.log_ = function(message) {
  if (message) {
    var debugMessage = 'DEBUGGER: ' + message;
    constantUpdate('Debug', debugMessage);
    console.log(debugMessage);
  }
};


/**
 * Sets the inner text for the given element.
 *
 * @param {Element} element The element.
 * @param {string=} opt_text The text.
 * @private
 */
bcplayer.setInnerText_ = function(element, opt_text) {
  if (!element) {
    return;
  }
  element.innerText = opt_text || '';
};


/**
 * Sets the background image for the given element.
 *
 * @param {Element} element The element.
 * @param {string=} opt_url The image url.
 * @private
 */
bcplayer.setBackgroundImage_ = function(element, opt_url) {
  if (!element) {
    return;
  }
  element.style.backgroundImage =
      (opt_url ? 'url("' + opt_url.replace(/"/g, '\\"') + '")' : 'none');
  element.style.display = (opt_url ? '' : 'none');
};


/**
 * Called to determine if the receiver device is an audio device.
 *
 * @return {boolean} Whether the device is a Cast for Audio device.
 * @private
 */
bcplayer.isCastForAudioDevice_ = function() {
  var receiverManager = window.cast.receiver.CastReceiverManager.getInstance();
  if (receiverManager) {
    var deviceCapabilities = receiverManager.getDeviceCapabilities();
    if (deviceCapabilities) {
      return deviceCapabilities['display_supported'] === false;
    }
  }
  return false;
};
