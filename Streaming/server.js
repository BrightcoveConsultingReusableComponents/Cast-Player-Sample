//Defining express framework and other libraries variables
var express = require("express"),
    Firebase = require("firebase"),
    qs = require('querystring'),
    bs = require( "body-parser"),
    port = 1337,
    app = express()


//CORS middleware - Allow Cross Origin requests
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
    next();
}

//Firebase structure
var data = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/');
var dataDebug = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/Debug');
var dataMilestone = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/Milestone');
var dataPaused = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/Paused');
var dataStart = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/Start');
var dataVolumeChanged = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/VolumeChanged');
var dataBitRates = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/bitRates');
var dataCurrentDuration = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/currentDuration');
var dataCurrentId = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/currentId');
var dataCurrentTitle = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/currentTitle');
var dataIsLicenseSet = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/isLicenseSet');
var dataNewState = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/newState');
var dataNewTime = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/newTime');


data.on("value", function(snapshot) {
  console.log(snapshot.val());  //Log in the console everytime the data changes
});

//use the allowCrossDomain function and bodyparsing
app.use(allowCrossDomain);
app.use(express.static(__dirname));
//app.use(bodyParser()); is now deprecated
app.use(bs.json());
app.use(bs.urlencoded({
  extended: true
}));

app.post('/', function(req,res){
        //get and parse data
        var message = req.body;
        var key = Object.keys(message)[0];
        var info = message[key];
        if(key){
          handleKey(key, info);
        }
        res.send("ok");
});

//Handle the message sent via POST and modify the database
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
      dataCurrentId.transaction(function (value) {
        return (info);
      });
    } else if(key == 'currentTitle'){
      dataCurrentTitle.transaction(function (value) {
        return (info);
      });
    } else if(key == 'currentDuration'){
      dataCurrentDuration.transaction(function (value) {
        return (info);
      });
    } else if(key == 'isLicenseSet'){
      dataIsLicenseSet.transaction(function (value) {
        return (info);
      });
    } else if(key == 'bitRates'){
      dataBitRates.transaction(function (value) {
        return (info);
      });
    } else if(key == 'newState'){
      dataNewState.transaction(function (value) {
        return (info);
      });
    } else if(key == 'Start'){
      dataStart.transaction(function (value) {
        return (parseInt(value) + 1);
      });
    } else if(key == 'Paused'){
      dataPaused.transaction(function (value) {
        return (parseInt(value) + 1);
      });
    } else if(key == 'VolumeChanged'){
      dataVolumeChanged.transaction(function (value) {
        return (parseInt(value) + 1);
      });
    } else if(key == 'Milestone'){
      dataMilestone.transaction(function (value) {
        return (info);
      });
    } else if(key == 'newTime'){
      dataNewTime.transaction(function (value) {
        return (info);
      });
    } else if(key == 'debugData'){
      dataDebug.transaction(function (value) {
        return (info);
      });
    }
  }
}

console.log('Server running on port: ' + port);
app.listen(port);


