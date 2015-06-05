var express = require("express"),
    app     = express(),
    qs = require('querystring'),
    fs = require('fs'),
    bs = require( "body-parser"),
    stringify = require("json-stringify-pretty-compact");

//CORS middleware - Allow-Origin
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
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
            console.log("File was empty");
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
                //TO-DO TEST - Update MilestonePercentagePerSession
                    var newInfoAvgWatched = getAverageWatched(newInfo.secondsSeen);
                    var check = checkMilestone(newInfoAvgWatched);
                    var oldMilestoneValue = currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check];
                    var newMilestoneValue= ((oldMilestoneValue*views) + 1)/(views+1);
                    currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check] = newMilestoneValue;
                    
                //Seconds seen Update
                    var updatedSecondsS = updatedArrayOfSeconds(oldInfo.secondsSeen, newInfo.secondsSeen, parseInt(views));
                    currentData[newDataKeys[c]].secondsSeen = updatedSecondsS; 
                //Seconds Paused Update
                    var updatedSecondsP = updatedArrayOfSeconds(oldInfo.secondsPaused, newInfo.secondsPaused, parseInt(views));
                    currentData[newDataKeys[c]].secondsPaused = updatedSecondsP;   
                //Seconds Restarted Update
                    var updatedSecondsR = updatedArrayOfSeconds(oldInfo.secondsRestart, newInfo.secondsRestart, parseInt(views));
                    currentData[newDataKeys[c]].secondsRestart = updatedSecondsR; 
                //Add a view
                    currentData[newDataKeys[c]]["Views"] += 1;
                //TO-DO test - Add/update avg percentage watched  
                    currentData[newDataKeys[c]]["AvgPercentageWatched"] = getAverageWatched(updatedSecondsS);
                //TO-DO test - Add Date Values
                    var today = new Date();
                    var month = today.getMonth();
                    var year = today.getFullYear();

                    
                    if(year in currentData[newDataKeys[c]]["viewsYear"]){
                       currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;
                    } else {
                        currentData[newDataKeys[c]]["viewsYear"][year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;
                    }
            
                } else{
                     //Update
                     currentData[newDataKeys[c]] = newData[newDataKeys[c]];
                     //Add a view
                     currentData[newDataKeys[c]]["Views"] += 1;

                    //TO-DO test - Add/update avg percentage watched  
                    currentData[newDataKeys[c]]["AvgPercentageWatched"] = getAverageWatched(newData[newDataKeys[c]].secondsSeen);

                    //TO-DO TEST - Update MilestonePercentagePerSession
                    var newInfoAvgWatched = getAverageWatched(newData[newDataKeys[c]].secondsSeen);
                    var check = checkMilestone(newInfoAvgWatched);
                    currentData[newDataKeys[c]]["MilestonePercentagePerSession"] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check] += 1;

                    //TO-DO TEST - Update Date data
                    var today = new Date();
                    var month = today.getMonth();
                    var year = today.getFullYear();
                    
                    currentData[newDataKeys[c]]["viewsYear"] = {};
                    currentData[newDataKeys[c]]["viewsYear"][year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;
                }
            } else{
                //Update
                currentData[newDataKeys[c]] = newData[newDataKeys[c]];
                //Add a view
                currentData[newDataKeys[c]]["Views"] += 1;

                //TO-DO test - Add/update avg percentage watched  
                currentData[newDataKeys[c]]["AvgPercentageWatched"] = getAverageWatched(newData[newDataKeys[c]].secondsSeen);

                //TO-DO TEST - Update MilestonePercentagePerSession
                var newInfoAvgWatched = getAverageWatched(newData[newDataKeys[c]].secondsSeen);
                var check = checkMilestone(newInfoAvgWatched);
                currentData[newDataKeys[c]]["MilestonePercentagePerSession"] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                currentData[newDataKeys[c]]["MilestonePercentagePerSession"][check] += 1;
                
                //TO-DO Update Date data
                var today = new Date();
                var month = today.getMonth();
                var year = today.getFullYear();
                
                currentData[newDataKeys[c]]["viewsYear"] = {};
                currentData[newDataKeys[c]]["viewsYear"][year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                currentData[newDataKeys[c]]["viewsYear"][year][month] += 1;

            }
        }
        console.log("Done.");
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

        function getAverageWatched(array){
            var count = 0;
            for(var c = 0; c<array.length; c++){
                count = count + array[c];
            }
            var average = count/array.length;
            return average;
        }

        function checkMilestone(value) {
            var value = value * 10;
            var milestone = 0
            for(var v = 0; v<10; v++){
                if(value>=v){
                    milestone = v;
                }
            }
            return milestone;
        }
    });

    console.log('Request received');
    console.log('Server running at port 9999');

app.listen(9999);
