var express = require("express"),
    app     = express(),
    qs = require('querystring'),
    fs = require('fs'),
    bs = require( "body-parser"),
    stringify = require("json-stringify-pretty-compact");

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
            /*
            fs.appendFile("logs/log.json", jsonStringArray, function(err) {
                if(err) {
                console.log(err);
                } else {
                console.log("The file was saved!");
                }
            });
            */   
    next();
}

    app.use(allowCrossDomain);
    app.use(express.static(__dirname));
    app.use(bs());

    app.post('/', function(req,res){

        var newData = req.body;
        var newDataKeys = Object.keys(newData);

        var file_content = fs.readFileSync('logs/minlog.json');

        try {
            var currentData = JSON.parse(file_content);
            var currentDataKeys = Object.keys(currentData);
        } catch (e) {
            var currentData = {};
            console.log("empty file");
        }
        
        //Transform to binary array
        for(var n=0; n<newDataKeys.length; n++){
            var copy = newData[newDataKeys[n]];
            var duration = parseInt(newData[newDataKeys[n]].duration);
            newData[newDataKeys[n]].secondsSeen = transformToBinaryArray(copy.secondsSeen, duration);
            newData[newDataKeys[n]].secondsPaused = transformToBinaryArray(copy.secondsPaused, duration);
            newData[newDataKeys[n]].secondsRestart = transformToBinaryArray(copy.secondsRestart, duration);

        }

        
        for(var c = 0; c<newDataKeys.length; c++){
            if(typeof(currentDataKeys) != 'undefined'){
                if(currentDataKeys.indexOf(newDataKeys[c]) > -1){
                //Information about the data on file and on ajax call for the contentId related to c
                    var oldInfo = currentData[newDataKeys[c]];
                    var newInfo = newData[newDataKeys[c]];
                    var views = oldInfo["Views"];
                //Seconds seen Update
                    var updatedSecondsS = updatedArrayOfSeconds(oldInfo.secondsSeen, newInfo.secondsSeen, parseInt(views));
                    currentData[newDataKeys[c]].secondsSeen = updatedSecondsS; 

                //Seconds Paused Update
                    var updatedSecondsP = updatedArrayOfSeconds(oldInfo.secondsPaused, newInfo.secondsPaused, parseInt(views));
                    currentData[newDataKeys[c]].secondsPaused = updatedSecondsP;   
                //Seconds Restarted Update
                    var updatedSecondsR = updatedArrayOfSeconds(oldInfo.secondsRestart, newInfo.secondsRestart, parseInt(views));
                    currentData[newDataKeys[c]].secondsRestart = updatedSecondsR; 

                    currentData[newDataKeys[c]]["Views"] += 1;             
                } else{
                     currentData[newDataKeys[c]] = newData[newDataKeys[c]];
                     currentData[newDataKeys[c]]["Views"] += 1;
                }
            } else{
                currentData[newDataKeys[c]] = newData[newDataKeys[c]];
                currentData[newDataKeys[c]]["Views"] += 1;
            }
        }
        console.log("keep7");
        var spacedLog = stringify(currentData);
        var minLog = JSON.stringify(currentData);

        fs.writeFileSync("logs/spacedlog.json", spacedLog);
        fs.writeFileSync("logs/minlog.json", minLog);
        
        function updatedArrayOfSeconds(oldArray, newArray, views) {
            var updated = [];
            for(var i = 0; i<oldArray.length; i++){
                var update = ((oldArray[i]*views) + newArray[i])/(views + 1);
                updated.push(Number(update.toFixed(2)));
            }
            return updated;
        }

        function transformToBinaryArray(array, duration){
            var binary = [];
            for(var k = 0; k<(duration + 1); k++){
                if(array.indexOf(k) > -1){
                    binary.push(1);
                }else {
                    binary.push(0);
                }
            }
            return binary;
        }
        
       
        
        /*****ASYNC
        var fileName = 'logs/log.json';
        var file = require(fileName);
        */
        

    });

    console.log('Request received');
    console.log('Server running at port 9999');


app.listen(9999);
