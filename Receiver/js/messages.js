/*
 This file deals with the extra messages between sender-receiver, such as color change and also with the messages sent
 to an external server to keep track of data.
 */

/*
 * SERVER MESSAGES
 **************************
 */


 /*
ConstantUpdateServer is the server that will constantly get the information provided by user interaction
FinalDataServer is the server the will get the final analytics status after the cast session is over 
*/

var constantUpdateServer = null;
var finalDataServer = "http://10.1.49.38:9999";

/**
 * Send data via ajax to a determined server
 *
 * @param content and server url
 * @return Void
 * @private
 */
function sendAjaxData(dataContent, urlString) {
  var submit = $.ajax({
          url: urlString, 
          type: 'POST', 
          contentType: 'application/json', 
          data: JSON.stringify(dataContent),
        error: function(error) {
          console.log("Error - AJAX");
        }
      });
        submit.success(function (data) {
          var success = data;
          //console.log(success)
      });
};

/**
 * Uses sendAjaxData to send a sample message for the pattern/normal events
 *
 * @param EventString
 * @return Void
 * @private
 */
function constantUpdate(EventString, data){
  //Sending paused event to external server to generate analytics data
  var sendingUpdateMessage = {};
  sendingUpdateMessage[EventString] = data;
  console.log(data);
  if(constantUpdateServer){
      sendAjaxData(sendingUpdateMessage, constantUpdateServer);
  }

};

/*
 * GENERAL MESSAGES - SENDER->RECEIVER
 **************************
 */

/**
 * Deal with the messages delivered to the receiver directly
 *
 * @param the player, the type and value of the message
 * @return Void
 * @private
 */
function dealWithMessage(self, type, value){
	//Logs the message
	console.log('MESSAGE: type-> '+type+' value-> '+value)
	//If the message is related, we deal with it in a separate function
	if (type === 'license' || type === 'manifestCredentials' || type === 'segmentCredentials' || type === 'licenseCredentials' || type === 'customData') {
	  licenseMessage(self, type, value);
	} else if (type === 'color'){
	     var progressColor = value;
	     changeColor(progressColor);
	} else if (type === 'control'){
	      showControls();
	} else if(type === 'bandwith'){
	      self.maxBandwith_ = value;
	} else if(type === 'mode'){
	       if(value == '1'){
	        $('.player').css('left', '150px');
	        $('.player').css('right', '150px');
	        $('.player').css('top', 0);
	        $('.player').css('bottom', 0);
	       } else if(value == '2'){
	        $('.player').css('left', 0);
	        $('.player').css('right', 0);
	        $('.player').css('top', '70px');
	        $('.player').css('bottom', '70px');
	       } else{
	        $('.player').css('left', 0);
	        $('.player').css('right', 0);
	        $('.player').css('top', 0);
	        $('.player').css('bottom', 0);
	       }       
	} 
    
    //Change the color pattern of the file
	function changeColor(color) {
		self.changeColorPattern(color);
		showControls();
	}
    
    //Show the control bar for a few seconds(play, pause, progress bar etc)
	function showControls(){
	if($('.player .overlay').css("visibility") == "hidden"){
	  $('#hide').css("display", "block");
	  $('#hide').css("visibility", "visible");
	  $('#hide .controls-play-pause').css("display", "block");
	  $('#hide .controls-play-pause').css("visibility", "visible");
	  $('#hide .controls-cur-time').css("display", "block");
	  $('#hide .controls-cur-time').css("visibility", "visible");
	  $('#hide .controls-total-time').css("display", "block");
	  $('#hide .controls-total-time').css("visibility", "visible");
	  $('#hide').fadeTo(4000, 0);
	  setTimeout(function() {
	      $('#hide').css("display", "none");
	      $('#hide').css("visibility", "hidden");
	      $('#hide .controls-play-pause').css("display", "none");
	      $('#hide .controls-play-pause').css("visibility", "hidden");
	      $('#hide .controls-cur-time').css("display", "none");
	      $('#hide .controls-cur-time').css("visibility", "hidden");
	      $('#hide .controls-total-time').css("display", "none");
	      $('#hide .controls-total-time').css("visibility", "hidden");
	      $('#hide').fadeTo(100, 1);
	   }, 4000);
	}
	}
};


/*
 * LICENSE
 **************************
 */


/**
 * Deal with the messages related to licensing
 *
 * @param the player, the type and value of the message
 * @return Void
 * @private
 */

function licenseMessage(self, type, value){
  /*If the message is related to license or credentials, we deal with it separately

  The license URL is added here. If some message specify some kind of credentials we add it here too*/
  console.log("HEEEEY");
  //Add license URL
  if (type === 'license') {
    self.licenseUrl_ = value;
    if(self.licenseUrl_.length === 0 || !self.licenseUrl_.trim()){
      self.licenseUrl_ = null;
      constantUpdate("License", ["No"]);
    } else{
      constantUpdate("License", ["Yes"]);
    }
  } 
  //Check for different kind of credentials and add them 
  else if (type === 'manifestCredentials') {
      self.manifestCredentials_ = value;
      if(self.manifestCredentials_.length === 0 || !self.manifestCredentials_.trim()){
        self.manifestCredentials_ = null;
      }
  } else if (type === 'segmentCredentials') {
      self.segmentCredentials_ = value;
      if(self.segmentCredentials_.length === 0 || !self.segmentCredentials_.trim()){
        self.segmentCredentials_ = null;
      }
  } else if (type === 'licenseCredentials') {
      self.licenseCredentials_ = value;
      if(self.licenseCredentials_.length === 0 || !self.licenseCredentials_.trim()){
        self.licenseCredentials_ = null;
      }
  } else if (type === 'customData') {
      self.customData_ = value;
      if(self.customData_.length === 0 || !self.customData_.trim()){
        self.customData_ = null;
      }
  }
}


/**
 * Adds the license and credentials information to the host
 *
 * @param the player, the host and the url
 * @return Void
 * @private
 */

function checkLicense(self, host, url){
  //run license url
  if(self.licenseUrl_){
        host.licenseUrl = self.licenseUrl_;
        constantUpdate("License", ["Yes"]);
        console.log('License URL was set');
  }
  //check the credentials
  checkCredentials(self, host, url);
  
  //If credentials were set, we add the respective content to guarantee they will be used
  function checkCredentials(self, mediaHost, url){
    if (self.manifestCredentials_) {
        mediaHost.updateManifestRequestInfo = function(requestInfo) {
          if (!requestInfo.url) {
            requestInfo.url = url;
          }
          requestInfo.withCredentials = true;
        };
    }
    if (self.segmentCredentials_) {
      mediaHost.updateSegmentRequestInfo = function(requestInfo) {
        requestInfo.withCredentials = true;
        // example of setting headers - it should be CHANGED for different use cases
        requestInfo.headers = {};
        requestInfo.headers['content-type'] = 'text/xml;charset=utf-8';
      };
    }
    if (self.licenseCredentials_) {
      mediaHost.updateLicenseRequestInfo = function(requestInfo) {
        requestInfo.withCredentials = true;
      };
    }
  }
};