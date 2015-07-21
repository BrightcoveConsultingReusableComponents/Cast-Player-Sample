//Defining express framework and other libraries variables
var express = require("express"),
    Firebase = require("firebase"),
    qs = require('querystring'),
    bs = require( "body-parser"),
    port2 = 1337,
    stream = express()


//CORS middleware - Allow Cross Origin requests
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
    next();
}

//Firebase structure
var streamingData = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/');

streamingData.on("value", function(snapshot) {
  console.log(snapshot.val());  //Log in the console everytime the streamingData changes
});

//use the allowCrossDomain function and bodyparsing
stream.use(allowCrossDomain);
stream.use(express.static(__dirname));
//stream.use(bodyParser()); is now deprecated
stream.use(bs.json());
stream.use(bs.urlencoded({
  extended: true
}));

stream.post('/', function(req,res){
        //get and parse streamingData
        var message = req.body;
        var key = Object.keys(message)[0];
        var info = message[key];
        if(key){
          handleKey(key, info);
        }
        res.send("ok");
});

//Handle the message sent via POST and modify the streamingDatabase
function handleKey(key, info){

  function getAverage(array){
    var total = 0;
    for(var c=0; c<array.length; c++){
      total += array[c];
    }
    return total/array.length;
  }
  
  if(key == "Constant"){
    var currentId = info[0];
    var currentTitle = info[1];
    var currentDuration = info[2];
    var preparedData = {'currentId': currentId, 'currentTitle': currentTitle, 'currentDuration': currentDuration};
    setData(preparedData);
  } else if(key == "License") {
    var isLicenseSet = String(info[0]);
    var preparedData = {'isLicenseSet': isLicenseSet};
  } else if(key == "Bitrates") {
    var rates = info['video_bitrates'];
    var bitRates = getAverage(rates);
    var preparedData = {'bitRates': bitRates};
    setData(preparedData);
  } else if(key == "State") {
    var newState = info[0]; 
    var preparedData = {'newState': newState};
    setData(preparedData);
  } else if(key == "VolumeChanged" || key == "Start/Restart" || key == "Paused") {
      if(key == "Start/Restart"){
        var preparedData = {'Start': 'plusOne'};
      } else if(key == "Paused"){
        var preparedData = {'Paused': 'plusOne'};
      }else{
        var preparedData = {'VolumeChanged': 'plusOne'};
      }
      setData(preparedData);
  } else if(key == "Milestone") {
      var Milestone = parseInt(100*info[2]);
      if(Milestone == 90){Milestone = "90+"};  
      Milestone = String(Milestone) + "%";
      var preparedData = {'Milestone': Milestone};
      setData(preparedData);
  } else if(key == "Time"){
    var newTime = info[0];
    var newTime = String(newTime) + "%";
    var preparedData = {'newTime': newTime};
    if(info.length > 1){
      preparedData['newState'] = info[1];
    }
    setData(preparedData);
  } else if(key == "Debug"){
    var debugData = info;
    var preparedData = {'debugData': debugData};
    setData(preparedData);
  }
}

function setData(object){
  var keys = Object.keys(object);
  for(var i=0; i<keys.length; i++){
    updateDatabase(keys[i], object[keys[i]]);
  }

  function updateDatabase(key, info){
    if(key == 'currentId'){
      streamingData.child('currentId').transaction(function (value) {
        return (info);
      });
    } else if(key == 'currentTitle'){
      streamingData.child('currentTitle').transaction(function (value) {
        return (info);
      });
    } else if(key == 'currentDuration'){
      streamingData.child('currentDuration').transaction(function (value) {
        return (info);
      });
    } else if(key == 'isLicenseSet'){
      streamingData.child('isLicenseSet').transaction(function (value) {
        return (info);
      });
    } else if(key == 'bitRates'){
      streamingData.child('bitRates').transaction(function (value) {
        return (info);
      });
    } else if(key == 'newState'){
      streamingData.child('newState').transaction(function (value) {
        return (info);
      });
    } else if(key == 'Start'){
      streamingData.child('Start').transaction(function (value) {
        return (parseInt(value) + 1);
      });
    } else if(key == 'Paused'){
      streamingData.child('Paused').transaction(function (value) {
        return (parseInt(value) + 1);
      });
    } else if(key == 'VolumeChanged'){
      streamingData.child('VolumeChanged').transaction(function (value) {
        return (parseInt(value) + 1);
      });
    } else if(key == 'Milestone'){
      streamingData.child('Milestone').transaction(function (value) {
        return (info);
      });
    } else if(key == 'newTime'){
      streamingData.child('newTime').transaction(function (value) {
        return (info);
      });
    } else if(key == 'debugData'){
      streamingData.child('Debug').transaction(function (value) {
        return (info);
      });
    }
  }
}

console.log('Streaming running on port: ' + port2);
stream.listen(port2);


