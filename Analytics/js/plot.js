$(document).ready(function(){
  //Global variables
  var contentId = "";
  var year = 2015;
  var database = new Firebase('https://intense-heat-5166.firebaseio.com/analytics/'); 
  //function to trigger a svg plot
  function triggerPlot(contentId){
    tab = String($( ".active a" ).attr('id')); 
    if(tab == "tab4"){
      otherEvents(database, contentId); 
    } else if(tab == "tab3"){
      lastMilestoneAchieved(database, contentId);
    } else if(tab == "tab2"){
      partsWatched(database, contentId); 
    }else {
     viewStatistics(database, contentId, year);
   }
 } 

 //append empty svg element
 d3.select("#graphs").append("svg:svg")
 .attr("id", "svgGraph")
 .attr("height", 400);

 //gets the keys from json and make them values for the select video tab
 database.on("value", function(snapshot) {
   var objects = snapshot.val();
   var keys = Object.keys(objects);
   var selectValues = {};
   for(var i=0; i<keys.length; i++){
     selectValues[keys[i]] = objects[keys[i]]["title"];
   }
   $.each(selectValues, function(key, value) {   
     $('#selectOpt')
     .append($('<option>', { value : key })
      .text(value)); 
   });
 });
 
 //changes the contentId for the selected video and triggers the plot function 
 $( "#selectOpt" ).change(function(){
  contentId = ($(this).find(":selected").val());
  triggerPlot(contentId);
});

 

 //implements a search tool that selects the video searched (if exists) and triggers the plot function
 $('#searchButton').on("click", function() {
  var searchTerm = document.getElementById("searchbox");
  var searchBounds = document.getElementById("selectOpt");

  for(var i = 0; i < searchBounds.length; i++){
                searchBounds[i].style.backgroundColor = "#ff0"; 
                if(searchBounds[i].text.toLowerCase() == searchTerm.value.toLowerCase()){
                  searchBounds[i].selected = true;
                  searchBounds[i].style.backgroundColor = "#ff0";
                  searchBounds.style.backgroundColor = "#ff0";
                  contentId = searchBounds[i].value;
                  triggerPlot(contentId);
                }
              }
            });
 
 //implements an event to listen "enter" button entries that selects the video searched (if exists) and triggers the plot 
 $(document).keypress(function(e) {
  var searchTerm = document.getElementById("searchbox");
  var searchBounds = document.getElementById("selectOpt");

  for(var i = 0; i < searchBounds.length; i++){
                searchBounds[i].style.backgroundColor = "#FFFFFF"; //default color
                if(searchBounds[i].text.toLowerCase() == searchTerm.value.toLowerCase()){
                  searchBounds[i].selected = true;
                  searchBounds[i].style.backgroundColor = "#FFFF00";
                  searchBounds.style.backgroundColor = "#FFFF00";
                  contentId = searchBounds[i].value;
                  triggerPlot(contentId);
                }
              }
            });

 //Tab events to trigger different plots
 $("#tab1").on("click", function(){ 
  viewStatistics(database, contentId, year);
});
 $("#tab2").on("click", function(){
  partsWatched(database, contentId); 
});
 $("#tab3").on("click", function(){
  lastMilestoneAchieved(database, contentId);
});
 $("#tab4").on("click", function(){
  otherEvents(database, contentId); 
});



});