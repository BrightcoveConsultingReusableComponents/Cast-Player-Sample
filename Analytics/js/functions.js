function normalizeArray(array){
  var normal = [];
  var max = Math.max.apply(null, array);
  if(max == 0){max = 1};
  for(var c = 0; c<array.length; c++){
      normal.push(array[c]/max);
  }
  return normal;
}

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
    var multi = 100/data.length;

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, (multi*data.length)]).range([0, w]);
    //Y scale will fit values from 0 to 110% within pixels h-0 
    var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);


    // create xAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickFormat(function(d){return String(d)+'%'}).tickSubdivide(true);
    //Add to the plot
    graph.append("svg:g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);


    //create yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).tickFormat(function(d){return String(d)+'%'}).orient("left");
    //Add to the plot
    graph.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(-25,0)")
    .call(yAxisLeft);
    
    //Area surrounding the line
    var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d, i) { return x(multi*i); })
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

function viewStatistics(file, contentId, year) {

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

  //gets data from JSON
  d3.json(file, function(data){
    //Change the title string
    var name = data[contentId].title;
    var views = data[contentId].Views;
    var duration = data[contentId].duration;
    $(".container h4").html('<mark>Name:</mark> '+name+' <mark>Views:</mark> '+views+' <mark>Duration:</mark> '+parseInt(duration))+'sec';
    //Get the relevant information
    var data = data[contentId].viewsYear[year];
    //Create month dictionary and max value for scale
    var monthDict = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    var max = Math.max.apply(null, data);

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, 11]).range([0, w]);
    //Y scale will fit values from 0 to 110% within pixels h-0 
    var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);
    

    // create a line function to get x and y values for the plot
    var line = d3.svg.line()
      .x(function(d,i) {
        return x(i); 
      })
      .y(function(d) {
        return y(d); 
      })


    //create xAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true).tickFormat(function(d){ return monthDict[d]});
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

    // An area generator, for the light fill.
    var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d, i) { return x(i); })
    .y0(h)
    .y1(function(d, i) { return y(data[i]); });

      //Clip path
      graph.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", w)
      .attr("height", h);

    ////Area surrounding the line
    graph.append("path")
    .attr("class", "area")
    .attr("clip-path", "url(#clip)")
    .attr("d", area(data))
    .style("fill", "lightgreen");

    //Makes the multiple lines
    graph.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "circle")
    .style("fill", "green")
    .attr("r", 3.5)
    .attr("cx", function(d, i) { return x(i); })
    .attr("cy", function(d, i) {return y(data[i]); });
  });
}

function lastMilestoneAchieved(file, contentId){
  //remove previous SVG element
  d3.select("#svgGraph").remove();
  var margin = {top: 20, right: 20, bottom: 30, left: 40};
  var width = 850,
  height = 400;
  
  //Create x, y and color scales and axis
  var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
  .range([height, 0]);

  var color = d3.scale.linear()
  .domain([-1, 2])
  .range(["yellow", "blue"]);

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .ticks(10, "%");

  //Append the new svg
  var svg = d3.select("#graphs").append("svg")
  .attr("id", "svgGraph")
  .attr("width", width)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //gets data from JSON file
  d3.json(file, function(milestone){
    //Change the title string
    var name = milestone[contentId].title;
    var views = milestone[contentId].Views;
    var duration = milestone[contentId].duration;
    $(".container h4").html('<mark>Name:</mark> '+name+' <mark>Views:</mark> '+views+' <mark>Duration:</mark> '+parseInt(duration))+'sec';
    //Gets relevant info
    var info = milestone[contentId].MilestonePercentagePerSession;
    //Creates the data array
    var data = [];

    function getSum(array){
      var count = 0;
      for(var c = 0; c<array.length; c++){
        count = count + array[c];
      }
      return count;
    }   

    for(var i=0; i<info.length; i++){
      var frequency = info[i]/getSum(info);
      data[i] = {"letter": String(25*(i)) + "% Milestone", "frequency": frequency};
    }
    data[4] =  {"letter": "+90% Milestone", "frequency": info[4]/getSum(info)};
    
    //mapping x,y with the data values
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    //group append to call axis
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end");
    
    //Makes the bars
    svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.letter); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.frequency); })
    .attr("height", function(d) { return height - y(d.frequency); })
    .style("fill", function(d) { return color(d.frequency)});
    
  });
}

function otherEvents(file, contentId){
// Desired dimensions and margin.
  var m = [80, 80, 80, 80]; // margins
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

  //gets data from JSON
  d3.json(file, function(data) {
  //Change the title string
  var name = data[contentId].title;
  var views = data[contentId].Views;
  var duration = data[contentId].duration;
  $(".container h4").html('<mark>Name:</mark> '+name+' <mark>Views:</mark> '+views+' <mark>Duration:</mark> '+parseInt(duration))+'sec';

  //Gets the relevant information
  var dataPause = decompressToDecArray(data[contentId].secondsPaused);
  dataPause = normalizeArray(dataPause);
  var dataRestart = decompressToDecArray(data[contentId].secondsRestart);
  dataRestart = normalizeArray(dataRestart)
  var dataVolumeChanges = decompressToDecArray(data[contentId].secondsVolumeChanged);
  dataVolumeChanges = normalizeArray(dataVolumeChanges);
  

  for(var i=0; i<dataPause.length; i++){
    dataPause[i] *= 100;
    dataRestart[i] *= 100;
    dataVolumeChanges[i] *= 100;
  }

  var maxArray = [Math.max.apply(null, dataPause), Math.max.apply(null, dataRestart), Math.max.apply(null, dataVolumeChanges)];
  var max = Math.max.apply(null, maxArray);
  var multi = 100/dataPause.length;

  // x scale
  var x = d3.scale.linear().domain([0, (multi*dataPause.length)]).range([0, w]);
  // y scale
  var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);

  // create a line function for each of the concepts
  var linePause = d3.svg.line()
    .x(function(dataPause,i) { 
      return x(i*multi); 
    })
    .y(function(dataPause) { 
      return y(dataPause); 
    });

  var lineRestart = d3.svg.line()
    .x(function(dataRestart,i) { 
      return x(i*multi); 
    })
    .y(function(dataRestart) { 
      return y(dataRestart); 
    });

  var lineVolume = d3.svg.line()
    .x(function(dataVolumeChanges,i) { 
      return x(i*multi); 
    })
    .y(function(dataVolumeChanges) { 
      return y(dataVolumeChanges); 
    });

    // create xAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickFormat(function(d){return String(d)+'%'}).tickSubdivide(true);
    // Add to the plot
    graph.append("svg:g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);


    // create yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).tickFormat(function(d){return String(d)+'%'}).orient("left");
    // Add to the plot
    graph.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(-25,0)")
    .call(yAxisLeft);

    
     //Makes the lines
    graph.append("svg:path").attr("d", lineRestart(dataRestart)).style("stroke", "darkgreen");
    graph.append("svg:path").attr("d", linePause(dataPause)).style("stroke", "red");
    graph.append("svg:path").attr("d", lineVolume(dataVolumeChanges)).style("stroke", "orange");
  });
}