# Introduction
## IMPORTANT: The info from the database was exported to a json file in database.json, so it can be reused on another server.
## Reasons to use Firebase
* JSON storage and real time updates
* Automatically scales with the app (paid account)
* Good for cross-platform apps (Android, iOs, Javascript)
* First-Class security features


##Some basic commands<br>

* Write:
```javascript
set();
update(); 
push();
transaction();
```

* Read - General<br>
```javascript
on('event', function());
once('event', function());
off('event', function());
```

'event' as a general event, such as 'value'<br>
* Read - Query specific <br>
```javascript
child();
orderByChild();
orderByKey();
orderByValue();
orderByPriority();
limitToFirst();
limitToLast(); 
startAt();
endAt();
equalTo();
```javascript
* Read - Events <br>

```json
Value
Child Added
Child Changed
Child Removed
Child Moved
```

The full disclosure of the API (including Auth) is [here](https://www.firebase.com/docs/web/api/). <br>
The methods used for this sample project were: set(), transaction() and child().

## Data organization

#### Streaming Part
Streaming <br>
----Debug: <br>
----Milestone: <br>
----Paused: <br>
----Start: <br>
----VolumeChanged: <br>
----bitRates: <br>
----currentDuration: <br> 
----currentId: <br>
----currentTitle: <br>
----isLicenseSet: <br>
----newState: <br>
----newTime: <br>

String/Numbers for each of the keys. <br>

#### Analytics Part

The structure is similar to this:

```json
"analytics" : {
    "https%3A%2F%2Fcommondatastorage%2Egoogleapis%2Ecom%2Fgtv-videos-bucket%2Fsample%2FForBiggerFun%2Emp4" : {
      "AvgPercentageWatched" : 0.5633333333333336,
      "MilestonePercentagePerSession" : [ 4, 0, 2, 2, 2 ],
      "Views" : 10,
      "duration" : 60.070023,
      "secondsPaused" : "0/0/1/3/0/1/0/0/0/0/1/0/0/0/0/0/1/0/0/0",
      "secondsRestart" : "a/0/1/2/0/0/0/0/0/0/1/1/0/0/0/0/1/0/0/0",
      "secondsSeen" : "1e/1e/1e/1c/18/12/12/11/f/f/f/e/c/c/c/c/9/9/9/9",
      "secondsVolumeChanged" : "0/0/0/0/0/3/1/0/0/0/0/0/0/0/0/0/0/0/0/0",
      "title" : "For Bigger Fun",
      "viewsYear" : {
        "2015" : [ 0, 0, 0, 0, 0, 4, 6, 0, 0, 0, 0, 0 ]
      }
      ...
```

<h5>Let's describe what each of these parts mean.</h5> 

* 1. This represents the contentId keys. The whole JSON object has as the primary key the unique contentId of each video. The value of each of these keys is another JSON object (similar to a dictionary) that represents all the information from the video. It is encrypted, so Firebase would let us write url as keys, that's why there are some code-numbers in the middle like %2F, %2E, etc.

```json
"https%3A%2F%2Fcommondatastorage%2Egoogleapis%2Ecom%2Fgtv-videos-bucket%2Fsample%2FForBiggerFun%2Emp4"
```
* 2. This part represents some immutable information from each video: the title and the duration. 
```json
    "title": "For Bigger Fun",
    "duration": 60.070023,
```
* 3. This is probably the most important part. It captures the seconds of each video for every 5% of the video watched. Each of element divided by the "/" represents how many seconds were watched in total of the correspondent 5% part of the video in HEXADECIMAL. <br><br>For example, if we have secondsSeen: "0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/a", it means that for the first 95% part of the video were never watched, and the last one was watched for 10 seconds. As we have the total views and the duration, it's easy to decompress each part of the HEXADECIMAL string, normalize by duration and views and obtain the graph for that, without having to store enormous binary arrays. Similarly, we have the same information for Paused, Restart/Start and Volume Changed.  
```json
    "secondsSeen": "c/c/c/c/c/6/6/6/6/6/6/6/6/6/6/6/2/0/0/0",
    "secondsPaused": "0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0",
    "secondsRestart": "4/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0",
    "secondsVolumeChanged": "0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0",
```
* 4. This represents the total views of the video that will be used for all the following attributes
```json
    "Views": 4,
```
-5. This considers the total views and the percentage watched of the video for each session and gives the average percentage of the video watched per cast session
```json
    "AvgPercentageWatched": 0.5333333333333333,
```
* 6. This represents the milestones per session. Every session has a milestone for a video watched. If the user watched 100% of the video, it is added to the final index, if it watched 0%, it will be added to the first index. 
```json
    "MilestonePercentagePerSession": [2, 0, 0, 2, 0],
```
* 7. This represents the division of views, per year and per month. As it was all tested during June 2015, all the 4 views are concentrated there.
```json
    "viewsYear": {"2015": [0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0]}
```


