function licenseMessage(self, type, value){
  //If the message is related to license or credentials, we deal with it separately
  //The license URL is added here. If some message specify some kind of credentials we add it here too

  //Add license URL
  if (type === 'license') {
    self.licenseUrl_ = value;
    if(self.licenseUrl_.length === 0 || !self.licenseUrl_.trim()){
      self.licenseUrl_ = null;
      self.constantUpdate_("License", ["No"]);
    } else{
      self.constantUpdate_("License", ["Yes"]);
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

function checkLicense(self, host, url){
  //run license url
  if(self.licenseUrl_){
        host.licenseUrl = self.licenseUrl_;
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
}


    