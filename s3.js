/**
Copyright (C) 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/

var express = require("express"),
    app     = express(),
    port    = 9999,
    qs = require('querystring'),
    fs = require('fs'),
    url = require( "url" );

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

     if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
        });
        req.on('end', function () {
            
            console.log("oi");
            var POST = qs.parse(body);
            console.log(POST);
            console.log(typeof(POST));
            var str = String(POST);
            console.log(str);

            /*
            jsonString = JSON.stringify(POST);

            var contentId = "first";
            var array = {};
            array[contentId] = ["hi", 0, [5, 8], "hiii"];
            console.log(POST);
            console.log(body);
            console.log(array);
            jsonStringArray = JSON.stringify(array, null, 4);
            */
            
            /*
            fs.appendFile("logs/log.json", jsonStringArray, function(err) {
                if(err) {
                console.log(err);
                } else {
                console.log("The file was saved!");
                }
            });
            */

        });
    }
    
    next();
}

    app.use(allowCrossDomain);
    app.use(express.static(__dirname));

    console.log('Request received');
    console.log('Server running at port 9999/');


app.listen(port);
