# Streaming

The streaming application is an html page with javascript and css embedded. The streaming loads the firebase database and keep tracks of the changes on each one of its variables. Therefore, when the title in the database changes, it listens to the variation and modifies the respective item with jQuery, keeping track of data in real-time. When the data first load, we set the variables to an 'idle' value.

```javascript
//Call the database (Firebase)
var data = new Firebase('https://intense-heat-5166.firebaseio.com/streaming/'); 
//Set it to the idle state
data.set ({
  Debug : "",
  Milestone : "0%",
  Paused : 0,
  Start : 0,
  VolumeChanged : 0,
  bitRates : 0,
  currentDuration : 0,
  currentId : "",
  currentTitle : "",
  isLicenseSet : "No",
  newState : "idle",
  newTime : "0%"
});
```

The chosen variables for these parts are:<br>

* Play <br>
* Pause <br>
* Volume Change <br> <br>
* Content ID <br> <br>
* Percentage <br>
* Title <br>
* Average Bitrates <br>
* Duration <br>
* License Set? <br>
* Current State <br>
* Last Milestone Achieved <br>

The first, second and third one keep track of how many times the user pressed play/pause/volume buttons. <br>
The fourth one is related to the current ID playing and when a new ID is set, the play/pause/volume change back to 0. <br>
```javascript
//If the contentId changes, change the ID list item to show the new ID and restart the pause/start/volume settings
data.child('currentId').on("value", function(snapshot) {
  $("#currentId").html(snapshot.val());
  changeColor('#currentId');
  data.child('Paused').set(0);
  data.child('Start').set(0);
  data.child('VolumeChanged').set(0);
});
```
The other items are the string obtained from each change of the respective field in the database. <br>
```javascript
data.child('Milestone').on("value", function(snapshot) {
      $("#milestone").html(snapshot.val());
      changeColor('#milestone');
});
```
The change color function modifies the color of the referred item when the value in the database changes, providing a simple animation to the variables.
