if(this.licenseUrl_){
        host.licenseUrl = this.licenseUrl_;
        console.log('License URL was set');
      }
      if (this.manifestCredentials_) {
          host.updateManifestRequestInfo = function(requestInfo) {
            if (!requestInfo.url) {
              requestInfo.url = url;
            }
            requestInfo.withCredentials = true;
          };
      }
      if (this.segmentCredentials_) {
        host.updateSegmentRequestInfo = function(requestInfo) {
          requestInfo.withCredentials = true;
          // example of setting headers
          //requestInfo.headers = {};
          //requestInfo.headers['content-type'] = 'text/xml;charset=utf-8';
        };
      }
      if (this.licenseCredentials_) {
        host.updateLicenseRequestInfo = function(requestInfo) {
          requestInfo.withCredentials = true;
        };
      }




      else if (myEvent['type'] === 'manifestCredentials') {
        this.manifestCredentials_ = myEvent.value;
        if(this.manifestCredentials_.length === 0 || !this.manifestCredentials_.trim()){
          this.manifestCredentials_ = null;
        }
    } else if (myEvent['type'] === 'segmentCredentials') {
        this.segmentCredentials_ = myEvent.value;
        if(this.segmentCredentials_.length === 0 || !this.segmentCredentials_.trim()){
          this.segmentCredentials_ = null;
        }
    } else if (myEvent['type'] === 'licenseCredentials') {
        this.licenseCredentials_ = myEvent.value;
        if(this.licenseCredentials_.length === 0 || !this.licenseCredentials_.trim()){
          this.licenseCredentials_ = null;
        }
    } else if (myEvent['type'] === 'customData') {
        this.customData_ = myEvent.value;
        if(this.customData_.length === 0 || !this.customData_.trim()){
          this.customData_ = null;
        }
    } 


    if(this.licenseUrl_.length === 0 || !this.licenseUrl_.trim()){
        this.licenseUrl_ = null;
        this.constantUpdate_("License", ["No"]);
      } else{
        this.constantUpdate_("License", ["Yes"]);
      }


      console.log( "css edit ready!" );

//changes the progress bar color
var progressColor = null;


//changes the background color
var backgroundColor = null;

//changes the background image cover
var myBackgroundUrl = '../css/assets/background.png';

//changes the logo image cover
var myLogoUrl = null;


//progress bar color
if(progressColor){
$('.player .progressBar').css("background-color", progressColor);
}

//body background color
if(backgroundColor){
$('body').css("background-color", backgroundColor)
}

//logo
if(myLogoUrl){
$('.logo').css("background-image", "url("+myLogoUrl+")"); 
}

//background image cover
if(myBackgroundUrl){
$('.player').css("background-image", "url("+myBackgroundUrl+")");  
}