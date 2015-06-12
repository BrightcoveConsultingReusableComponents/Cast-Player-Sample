# Analytics Introduction
The analytics folder was constructed to display an example of how the chromecast data could be used in a separate and particular way. It shows some information such as views/month, parts most commonly watched, pause/restart/volume statistics and milestones achieved. The data is all divided by cast sessions. Therefore the same logic follows for the analytics part.


#Bootstrap and d3.js
Bootstrap was used for the basic styling with css/jquery libraries, so it would be responsive and clean. D3.js was the chosen library to implement the graphs, seen that it has a lot of freedom to handle the data and provide some beautiful ways to display axis.

#Structure
The basic file structure is:

```
-index.html
-css
-----bootstrap-theme.css	
-----bootstrap-theme.css.map	
-----bootstrap-theme.min.css	
-----bootstrap.css	
-----bootstrap.css.map	
-----bootstrap.min.css	
-----styles.css
-fonts
-----glyphicons-halflings-regular.eot	Added Analytics Folder. 
-----glyphicons-halflings-regular.svg	Added Analytics Folder. 
-----glyphicons-halflings-regular.ttf	Added Analytics Folder. 
-----glyphicons-halflings-regular.woff	Added Analytics Folder. 
-----glyphicons-halflings-regular.woff2	Added Analytics Folder. 
-js
-----bootstrap.js	
-----bootstrap.min.js	
-----functions.js
-----npm.js
-----plot.js
```

-The index.html is just a simple html file with the divisions of each part of the graphs.<br>
-All the bootstrap css files refers to preprocessed bootstrap modules for styling and styles.css is a very simple file that changes some basic elements of that.<br>
-Fonts refers to some external fonts loaded to make bootstrap possible.<br>
-The bootstrap.js files refers to the general use of bootstrap as before. <br> 
-<b>Functions.js</b> and <b>Plot.js</b> are the base of all the Analytics parts. There is heavily implemented d3.js and jQuery to make an interactive visualization of the data. The main functions used are d3.json (load json files) and some jQuery tabs logics, along different methods of plotting and organizing information.

#Graphs and Analysis

Simple explanation to exemplify: 

<h3>Parts Watched Graph</h3>

<b>The event is fired in plot.js (could be via a tab, button, search)</b>:
```javascript
triggerPlot(contentId);
partsWatched(file, contentId);
```

<b>The function starts by setting some size parameters:</b>
```javascript
function partsWatched(file, contentId){
  // Desired dimensions and margin.
  var m = [80, 90, 80, 90]; // margins
  var w = 1000 - m[1] - m[3]; // width
  var h = 450 - m[0] - m[2]; // height
  //remove the previous svg element
  d3.select("#svgGraph").remove();
  
  //Add the new svg element
  var graph = d3.select("#graphs").append("svg:svg")
  .attr("id", "svgGraph")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .append("svg:g")
  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
```
<b>The function loads json files and set x, y values:</b>
```javascript
  //gets data from JSON
  d3.json(file, function(data) {
    //Change the title string
    var name = data[contentId].title;
    var views = data[contentId].Views;
    var duration = data[contentId].duration;
    $(".container h4").html('<mark>Name:</mark> '+name+' <mark>Views:</mark> '+views+' <mark>Duration:</mark> '+parseInt(duration))+'sec';

    //get the relevant information
    var data = decompressToDecArray(data[contentId].secondsSeen);
    data = normalizeArray(data);
    
    for(var i=0; i<data.length; i++){
      data[i] *= 100;
    }
    var max = Math.max.apply(null, data);

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
    //Y scale will fit values from 0 to 110% within pixels h-0 
    var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);
```

<b>The function presents the actual plot:</b>      
```javascript
    //create a line function to get x and y values for the plot
    var line = d3.svg.line()
      .x(function(d,i) {
        return x(i); 
      })
      .y(function(d) {
        return y(d); 
      })


      // create xAxis
      var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
      //Add to the plot
      graph.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);


      //create yAxis
      var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
      //Add to the plot
      graph.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(-25,0)")
      .call(yAxisLeft);
      
      //Area surrounding the line
      var area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) { return x(i); })
      .y0(h)
      .y1(function(d, i) { return y(data[i]); });

      //Clip Path
      graph.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", w)
      .attr("height", h);

      //Makes the line
      graph.append("path")
      .attr("class", "area")
      .attr("clip-path", "url(#clip)")
      .attr("d", area(data))
      .style("fill", "lightblue");
    });
}
```


