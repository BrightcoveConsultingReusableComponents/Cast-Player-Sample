function dealWithMessage(self, type, value){
	//If the message is related, we deal with it in a separate file
	//Check js/license.js to see the DRM settings for the function licenseMessage
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
