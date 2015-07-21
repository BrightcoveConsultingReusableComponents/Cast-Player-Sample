//Defining express framework and other libraries variables
var express = require("express"),
    app     = express(),
    stream = express(),
    port1 = 9999,
    port2 = 1337,
    qs = require('querystring'),
    bs = require( "body-parser"),
    Firebase = require("firebase");

//CORS middleware - Allow Cross Origin requests
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
    next();
}

//use the allowCrossDomain function and bodyparsing for the stream and app objects
app.use(allowCrossDomain);
app.use(express.static(__dirname));

stream.use(allowCrossDomain);
stream.use(express.static(__dirname));
//bodyParser(); is now deprecated, so it is necessary to to call the specific functions
//json() and urlencoded({})
app.use(bs.json());
app.use(bs.urlencoded({
  extended: true
}));

stream.use(bs.json());
stream.use(bs.urlencoded({
  extended: true
}));


/*
******* App Server
*/


//App server POST definitions
app.post('/', function(req,res){
    //get and parse data
    var newData = req.body;
    var newDataKeys = Object.keys(newData);

    var database = new Firebase('https://intense-heat-5166.firebaseio.com/analytics/');
    var currentData = {};
    database.once("value", function(snapshot) {
        currentData = snapshot.val();
        //See if database is empty or not
        try {
            var currentDataKeys = Object.keys(currentData);
        } catch (e) {
            var currentData = {};
            console.log("App - Database was empty");
        }
        
        try {
            //Transform to binary array
            for(var n=0; n<newDataKeys.length; n++){
                var copy = newData[newDataKeys[n]];
                var duration = parseInt(newData[newDataKeys[n]].duration);
                newData[newDataKeys[n]].secondsSeen = transformToBinaryArray(copy.secondsSeen, duration);
                newData[newDataKeys[n]].secondsPaused = transformToBinaryArray(copy.secondsPaused, duration);
                newData[newDataKeys[n]].secondsRestart = transformToBinaryArray(copy.secondsRestart, duration);
                newData[newDataKeys[n]].secondsVolumeChanged = transformToBinaryArray(copy.secondsVolumeChanged, duration);
            }
           

            //go through the old and new data and construct a new object with all the combined information
            for(var c = 0; c<newDataKeys.length; c++){
                if(typeof(currentDataKeys) != 'undefined'){
                    if(currentDataKeys.indexOf(newDataKeys[c]) > -1){
                    //Information about the data on file and on ajax call for the contentId related to c
                        var oldInfo = currentData[newDataKeys[c]];
                        var newInfo = newData[newDataKeys[c]];
                        var views = oldInfo["Views"];
                        var duration = oldInfo["duration"];
                    //Update MilestonePercentagePerSession
                        var newInfoAvgWatched = getAverageWatched(newInfo.secondsSeen);
                        var check = checkMilestone(newInfoAvgWatched);
                        currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check] += 1;
                    //***Seconds Arrays****
                    //Divide into intervals of 5% of the video
                        if(duration>20){
                            for(var n=0; n<newDataKeys.length; n++){
                                var copy = newData[newDataKeys[n]];
                                newData[newDataKeys[n]].secondsSeen = getSumArray(copy.secondsSeen, 20);
                                newData[newDataKeys[n]].secondsPaused = getSumArray(copy.secondsPaused, 20);
                                newData[newDataKeys[n]].secondsRestart = getSumArray(copy.secondsRestart, 20);
                                newData[newDataKeys[n]].secondsVolumeChanged = getSumArray(copy.secondsVolumeChanged, 20);
                            }  
                        } else{
                            for(var n=0; n<newDataKeys.length; n++){
                                var copy = newData[newDataKeys[n]];
                                newData[newDataKeys[n]].secondsSeen = getSumArray(copy.secondsSeen, Math.floor(duration));
                                newData[newDataKeys[n]].secondsPaused = getSumArray(copy.secondsPaused, Math.floor(duration));
                                newData[newDataKeys[n]].secondsRestart = getSumArray(copy.secondsRestart, Math.floor(duration));
                                newData[newDataKeys[n]].secondsVolumeChanged = getSumArray(copy.secondsVolumeChanged, Math.floor(duration));
                            }       
                        }
                    //Seconds seen Update
                        var updatedSecondsS = updatedArrayOfSeconds(decompressToDecArray(oldInfo.secondsSeen), newInfo.secondsSeen);
                        currentData[newDataKeys[c]].secondsSeen = updatedSecondsS; 
                    //Seconds Paused Update
                        var updatedSecondsP = updatedArrayOfSeconds(decompressToDecArray(oldInfo.secondsPaused), newInfo.secondsPaused);
                        currentData[newDataKeys[c]].secondsPaused = updatedSecondsP;   
                    //Seconds Restarted Update
                        var updatedSecondsR = updatedArrayOfSeconds(decompressToDecArray(oldInfo.secondsRestart), newInfo.secondsRestart);
                        currentData[newDataKeys[c]].secondsRestart = updatedSecondsR;
                    //Seconds Restarted Update
                        var updatedSecondsV = updatedArrayOfSeconds(decompressToDecArray(oldInfo.secondsVolumeChanged), newInfo.secondsVolumeChanged);
                        currentData[newDataKeys[c]].secondsVolumeChanged = updatedSecondsV; 
                    //Add a view
                        currentData[newDataKeys[c]]["Views"] += 1;
                    //Add/update avg percentage watched 
                        var normalSecondsS =  normalizeArray(updatedSecondsS, (duration/updatedSecondsS.length));
                        normalSecondsS =  normalizeArray(normalSecondsS, (views+1));
                        normalSecondsS =  normalizeArray(normalSecondsS, Math.max.apply(null, normalSecondsS));
                        currentData[newDataKeys[c]]["AvgPercentageWatched"] = getAverageWatched(normalSecondsS);
                    //Add Date Values
                        var today = new Date();
                        var month = today.getMonth();
                        var year = today.getFullYear();

                        
                        if(year in currentData[newDataKeys[c]]["viewsYear"]){
                           currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;
                        } else {
                            currentData[newDataKeys[c]]["viewsYear"][year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;
                        }
                        
                        //Compress
                        currentData[newDataKeys[c]].secondsSeen = compressToHexString(currentData[newDataKeys[c]].secondsSeen);
                        currentData[newDataKeys[c]].secondsPaused = compressToHexString(currentData[newDataKeys[c]].secondsPaused);
                        currentData[newDataKeys[c]].secondsRestart = compressToHexString(currentData[newDataKeys[c]].secondsRestart);
                        currentData[newDataKeys[c]].secondsVolumeChanged = compressToHexString(currentData[newDataKeys[c]].secondsVolumeChanged);
                
                    } else{
                        //Update ***Seconds Arrays****
                         currentData[newDataKeys[c]] = newData[newDataKeys[c]];
                         //Add a view
                         currentData[newDataKeys[c]]["Views"] += 1;

                        //TO-DO - CHANGE - - - Add/update avg percentage watched  
                        currentData[newDataKeys[c]]["AvgPercentageWatched"] = getAverageWatched(newData[newDataKeys[c]].secondsSeen);

                        //TO-DO - CHANGE - - - Update MilestonePercentagePerSession
                        var newInfoAvgWatched = getAverageWatched(newData[newDataKeys[c]].secondsSeen);
                        var check = checkMilestone(newInfoAvgWatched);
                        currentData[newDataKeys[c]]["MilestonePercentagePerSession"] = [0, 0, 0, 0, 0];
                        currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check] += 1;

                        //Update Date data
                        var today = new Date();
                        var month = today.getMonth();
                        var year = today.getFullYear();
                        
                        currentData[newDataKeys[c]]["viewsYear"] = {};
                        currentData[newDataKeys[c]]["viewsYear"][year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;

                        //Divide into intervals of 5% of the video
                        for(var n=0; n<newDataKeys.length; n++){
                            var copy = currentData[newDataKeys[c]];
                            currentData[newDataKeys[c]].secondsSeen = getSumArray(copy.secondsSeen, 20);
                            currentData[newDataKeys[c]].secondsSeen = compressToHexString(currentData[newDataKeys[c]].secondsSeen);
                            currentData[newDataKeys[c]].secondsPaused = getSumArray(copy.secondsPaused, 20);
                            currentData[newDataKeys[c]].secondsPaused = compressToHexString(currentData[newDataKeys[c]].secondsPaused);
                            currentData[newDataKeys[c]].secondsRestart = getSumArray(copy.secondsRestart, 20);
                            currentData[newDataKeys[c]].secondsRestart = compressToHexString(currentData[newDataKeys[c]].secondsRestart);
                            currentData[newDataKeys[c]].secondsVolumeChanged = getSumArray(copy.secondsVolumeChanged, 20);
                            currentData[newDataKeys[c]].secondsVolumeChanged = compressToHexString(currentData[newDataKeys[c]].secondsVolumeChanged);
                        } 


                    }
                } else{
                    //Update ***Seconds Arrays****
                     currentData[newDataKeys[c]] = newData[newDataKeys[c]];
                     //Add a view
                     currentData[newDataKeys[c]]["Views"] += 1;

                    //Add/update avg percentage watched  
                    currentData[newDataKeys[c]]["AvgPercentageWatched"] = getAverageWatched(newData[newDataKeys[c]].secondsSeen);

                    //Update MilestonePercentagePerSession
                    var newInfoAvgWatched = getAverageWatched(newData[newDataKeys[c]].secondsSeen);
                    var check = checkMilestone(newInfoAvgWatched);
                    currentData[newDataKeys[c]]["MilestonePercentagePerSession"] = [0, 0, 0, 0, 0];
                    currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check] += 1;

                    //Update Date data
                    var today = new Date();
                    var month = today.getMonth();
                    var year = today.getFullYear();
                    
                    currentData[newDataKeys[c]]["viewsYear"] = {};
                    currentData[newDataKeys[c]]["viewsYear"][year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;

                    //Divide into intervals of 5% of the video
                    for(var n=0; n<newDataKeys.length; n++){
                        var copy = currentData[newDataKeys[c]];
                        currentData[newDataKeys[c]].secondsSeen = getSumArray(copy.secondsSeen, 20);
                        currentData[newDataKeys[c]].secondsSeen = compressToHexString(currentData[newDataKeys[c]].secondsSeen);
                        currentData[newDataKeys[c]].secondsPaused = getSumArray(copy.secondsPaused, 20);
                        currentData[newDataKeys[c]].secondsPaused = compressToHexString(currentData[newDataKeys[c]].secondsPaused);
                        currentData[newDataKeys[c]].secondsRestart = getSumArray(copy.secondsRestart, 20);
                        currentData[newDataKeys[c]].secondsRestart = compressToHexString(currentData[newDataKeys[c]].secondsRestart);
                        currentData[newDataKeys[c]].secondsVolumeChanged = getSumArray(copy.secondsVolumeChanged, 20);
                        currentData[newDataKeys[c]].secondsVolumeChanged = compressToHexString(currentData[newDataKeys[c]].secondsVolumeChanged);
                    }

                }
            }
        } catch(e){
            console.log('App - Error parsing data');
        }
        //The parsing is done
        console.log("App - Session ended");
        var spacedLog = currentData;
        try {
            database.transaction(function (value) {
                return (spacedLog);
            });
        } catch(e){
            console.log('App - Could not finish the transaction');
        }
        
});
    
/*
******* AUXILIAR FUNCTIONS - App
*/

//update the array with the new seconds seen
function updatedArrayOfSeconds(oldArray, newArray) {
    var updated = [];
    for(var i = 0; i<oldArray.length; i++){
        var update = oldArray[i] + newArray[i];
        updated.push(Number(update));
    }
    return updated;
}
 
//binarize the array using the indexes given
function transformToBinaryArray(array, duration){
    var binary = [];
    for(var k = 0; k<(duration); k++){
        if(array.indexOf(k) > -1){
            binary.push(1);
        }else {
            binary.push(0);
        }
    }
    return binary;
}

// get the average watched from the array
function getAverageWatched(array){
    var count = 0;
    for(var c = 0; c<array.length; c++){
        count = count + array[c];
    }
    var average = count/array.length;
    return average;
}

//normalize the array
function normalizeArray(array, n){
    var normal = [];
    for(var c = 0; c<array.length; c++){
        normal.push(array[c]/n);
    }
    return normal;
}

//update the average watched
function getAverageUpdated(array){
    var count = 0;
    for(var c = 0; c<array.length; c++){
        count = count + array[c];
    }
    var average = count/array.length;
    return average;
}

//chech the milestone for determined value
function checkMilestone(value){
    if(value>0.9){
    var milestone = 4;
  } else if(value>0.75){
    var milestone = 3;
  } else if(value>0.5) {
    var milestone = 2;
  } else if(value>0.25){
    var milestone = 1;
  } else {
    var milestone = 0;
  }
  return milestone;
}


//turn the array into array of Sum
function getSumArray(array, n){
    var split = split(array, n);
    var avg = averageLengthModifier(split);
    var sum = sumInternalArray(split);
    var mult = multiplyArray(sum, avg);
    return mult;

    function split(array, n) {
        var len = array.length,
        out = [], 
        i = 0;
        while (i < len) {
            var size = Math.ceil((len - i) / n--);
            out.push(array.slice(i, i + size));
            i += size;
        }
        return out;
    }

    function mode(arr) {
        var numMapping = {};
        var greatestFreq = 0;
        var mode;
        arr.forEach(function findMode(number) {
            numMapping[number] = (numMapping[number] || 0) + 1;

            if (greatestFreq < numMapping[number]) {
                greatestFreq = numMapping[number];
                mode = number;
            }
        });
        return +mode;
    }

    function averageLengthModifier(array){
        var avg = [];
        var length = [];
        for(var i=0; i<array.length; i++){
            length.push(array[i].length);
        }
        var moda = mode(length);
        for(var i=0; i<array.length; i++){
            if(array[i].length != moda){
                avg.push(moda/array[i].length);
            } else{
                avg.push(1);
            }
        }
        return avg;
    }

    function sumInternalArray(array){
        var sum = [];
        for(var i=0; i<array.length; i++){
            var count = 0;
            for(var j=0; j<array[i].length; j++){
                count += array[i][j];
            }
            sum.push(count);
        }
        return sum;
    }

    function multiplyArray(array, array2){
        var mult = [];
        for(var i=0; i<array.length; i++){
            mult.push(parseInt(array[i]*array2[i]));
        }
        return mult;
    }

}
 
//Compress from deciaml array to hexadecimal string
function compressToHexString(array){
    var hex = '';
    for(var i=0; i<array.length; i++){
        hex += String(dec2hex(array[i])) + '/';
    }
    hex = hex.substring(0, hex.length - 1)
    return hex;

    function dec2hex(num){
        var ConvertBase = function (num) {
        return {
            from : function (baseFrom) {
                return {
                    to : function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
                        }
                    };
                }
            };
        };
    return ConvertBase(num).from(10).to(16);
    }
}
//decompress from hexadecimal string to decimal array
function decompressToDecArray(hexString){
     var hex = hexString.split("/");
     var dec = [];
     for(var i=0; i<hex.length; i++){
        dec.push(parseInt(hex2dec(hex[i])));
     }
     return dec;

     function hex2dec(num){
        var ConvertBase = function (num) {
        return {
            from : function (baseFrom) {
                return {
                    to : function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
                        }
                    };
                }
            };
        };
     return ConvertBase(num).from(16).to(10);

    }
}

});

/*
******* Streaming Server 
*/

//Firebase structure
var streamingData = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/');

/*streamingData.on("value", function(snapshot) {
  console.log('Firebase data streaming - onValue');  //Log in the console everytime the streamingData changes
});*/

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
        try{
            var key = Object.keys(message)[0];
            var info = message[key];
            if(key){
                handleKey(key, info);
            } 
        } catch(e){
            //console.log("Streaming - firebase called, database remained unchanged");
        }
        res.send("ok");
});

/*
******* Auxiliar functions - Streaming 
*/

//Handle the message sent via POST and modify the streamingDatabase
function handleKey(key, info){
  //get the average from an array
  function getAverage(array){
    var total = 0;
    for(var c=0; c<array.length; c++){
      total += array[c];
    }
    return total/array.length;
  }
  
  //deal with each of the different keys specifically
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

//Set the data in the Firebase data in relation with the new information provided
function setData(object){
  var keys = Object.keys(object);
  for(var i=0; i<keys.length; i++){
    updateDatabase(keys[i], object[keys[i]]);
  }
  
  //Use transactions to guarantee a minimum security when dealing with the database
  /*
  ***It's just a simple measure to protect information. However it must be way more heavily implemented to be safe for production
  */
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

//Log the current ports that both the App and the streaming analytics are running
console.log('App running on port:' + port1);
app.listen(port1);
console.log('Streaming running on port: ' + port2);
stream.listen(port2);
