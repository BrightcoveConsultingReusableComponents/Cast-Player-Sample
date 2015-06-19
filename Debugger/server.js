//Defining express framework and other libraries variables
var express = require("express"),
    app     = express(),
    qs = require('querystring'),
    fs = require('fs'),
    bs = require( "body-parser"),
    stringify = require("json-stringify-pretty-compact"),
    sse = require('sse');

//CORS middleware - Allow Cross Origin requests
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  
    next();
}


sse.writeSSEHead = function (req, res, cb) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });
    res.write("retry: 10000\n");
    return cb(req, res);
};

var lastData = "Session: ";
var myData = "Session: ";


sse.writeSSEData = function (req, res, event, data, cb) {
    var id = (new Date()).toLocaleTimeString();
    res.write("id: " + id + '\n');
    res.write("event: " + event + "\n");
    res.write("data: " + JSON.stringify(myData) + "\n\n");
    if (cb) {
        return cb(req, res);
    }
};


app.get('/stream/date', function(req, res) {

    var event = 'date';

    sse.writeSSEHead(req, res, function(req, res) {
      sse.writeSSEData(req, res, event, new Date(), function(req, res) {

        intervalx = setInterval(function() {
            if(lastData != myData){
               sse.writeSSEData(req, res, event, new Date());
               lastData = myData;
               console.log(myData);
            }
        }, 10);

        req.connection.addListener("close", function() {
            clearInterval(intervalx);
        });
      });
    });
});

//use the allowCrossDomain function and bodyparsing
    app.use(allowCrossDomain);
    app.use(express.static(__dirname));
    app.use(bs());

//server POST definitions
    app.post('/', function(req,res){
        //get and parse data
        var newData = req.body;
        myData = newData;
        res.send("ok");
    });

    console.log('Request received');
    console.log('Server running at port 1337');

app.listen(1337);
