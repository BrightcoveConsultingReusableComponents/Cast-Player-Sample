function partsWatched(contentId){
  // Add an SVG element with the desired dimensions and margin.
  var m = [80, 90, 80, 90]; // margins
  var w = 1000 - m[1] - m[3]; // width
  var h = 450 - m[0] - m[2]; // height

  d3.select("#svgGraph").remove();

  var graph = d3.select("#graphs").append("svg:svg")
        .attr("id", "svgGraph")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
      .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  d3.json("logs/minlog.json", function(data) {
    console.log(data[contentId].secondsSeen);
    
    var data = data[contentId].secondsSeen;
    
    for(var i=0; i<data.length; i++){
      data[i] *= 100;
    }
    var max = Math.max.apply(null, data);

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);
      // automatically determining max range can work something like this
      // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(d,i) { 
        // verbose logging to show what's actually being done
        console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
        // return the X coordinate where we want to plot this datapoint
        return x(i); 
      })
      .y(function(d) { 
        // verbose logging to show what's actually being done
        console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
        // return the Y coordinate where we want to plot this datapoint
        return y(d); 
      })


      // create yAxis
      var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
      // Add the x-axis.
      graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);


      // create left yAxis
      var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
      // Add the y-axis to the left
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

        // Add the clip path.
      graph.append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", w)
          .attr("height", h);

      // Add the area path.
      graph.append("path")
          .attr("class", "area")
          .attr("clip-path", "url(#clip)")
          .attr("d", area(data))
          .style("fill", "lightblue");
    });
    }

  function viewStatistics(contentId, year) {

    var m = [80, 90, 80, 90]; // margins
    var w = 1000 - m[1] - m[3]; // width
    var h = 450 - m[0] - m[2]; // height
    
    d3.select("#svgGraph").remove();

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#graphs").append("svg:svg")
          .attr("id", "svgGraph")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2])
        .append("svg:g")
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    //JSONIFY
    d3.json("logs/spacedlog.json", function(data){
      //
      var data = data[contentId].viewsYear[year];
      var monthDict = ["January","February","March","April","May","June","July","August","September","October","November","December"]
      var max = Math.max.apply(null, data);

      // X scale will fit all values from data[] within pixels 0-w
      var x = d3.scale.linear().domain([0, 11]).range([0, w]);
      // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
      var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);
        // automatically determining max range can work something like this
        // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

      // create a line function that can convert data[] into x and y points
      var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        .x(function(d,i) { 
          // verbose logging to show what's actually being done
          console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
          // return the X coordinate where we want to plot this datapoint
          return x(i); 
        })
        .y(function(d) { 
          // verbose logging to show what's actually being done
          console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
          // return the Y coordinate where we want to plot this datapoint
          return y(d); 
        })


        // create yAxis
        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true).tickFormat(function(d){ return monthDict[d]});
        // Add the x-axis.
        graph.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + h + ")")
              .call(xAxis);


        // create left yAxis
        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
        // Add the y-axis to the left
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

          // Add the clip path.
        graph.append("clipPath")
            .attr("id", "clip")
          .append("rect")
            .attr("width", w)
            .attr("height", h);

        // Add the area path.
        graph.append("path")
            .attr("class", "area")
            .attr("clip-path", "url(#clip)")
            .attr("d", area(data))
            .style("fill", "lightgreen");

        // Add the scatterplot
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

  function lastMilestoneAchieved(contentId){

    d3.select("#svgGraph").remove();
    var margin = {top: 20, right: 20, bottom: 30, left: 40};
    var width = 850,
        height = 400;

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

    var svg = d3.select("#graphs").append("svg")
        .attr("id", "svgGraph")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //d3.tsv("data.tsv", type, function(error, data) {
    d3.json("logs/spacedlog.json", function(milestone){
      var info = milestone[contentId].MilestonePercentagePerSession;
      var data = [];   
      
      for(var i=0; i<info.length; i++){
          data[i] = {"letter": String(i+1) + "0% Milestone", "frequency": info[i]}
      }
      data[8] =  {"letter": "+90% Milestone", "frequency": info[8]};
      

      x.domain(data.map(function(d) { return d.letter; }));
      y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

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

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.letter); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.frequency); })
          .attr("height", function(d) { return height - y(d.frequency); })
          .style("fill", function(d) { return color(d.frequency)});
    //
    });
}

  function otherEvents(contentId){

    var m = [80, 80, 80, 80]; // margins
    var w = 1000 - m[1] - m[3]; // width
    var h = 450 - m[0] - m[2]; // height

    d3.select("#svgGraph").remove();

    var graph = d3.select("#graphs").append("svg:svg")
            .attr("id", "svgGraph")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
          .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    d3.json("logs/minlog.json", function(data) {
    console.log(data[contentId].secondsPaused);
    console.log(data[contentId].secondsRestart);

    var dataPause = data[contentId].secondsPaused;
    var dataRestart = data[contentId].secondsRestart;
    //VOLUME var dataVolumeChanges = [1,1,1,0.75,1,1,1,1,1,1,0,1,1,1,1,0.75,0.75,1,0.75,0.75,0.75,0.75];

    

    for(var i=0; i<dataPause.length; i++){
      dataPause[i] *= 100;
      dataRestart[i] *= 100;
      //VOLUME dataVolumeChanges[i] *= 100;
    }

    var maxArray = [Math.max.apply(null, dataPause), Math.max.apply(null, dataRestart)/*VOLUME, Math.max.apply(null, dataVolumeChanges)*/];
    var max = Math.max.apply(null, maxArray);

    // X scale will fit all values from data[] within pixels 0-w
    var x = d3.scale.linear().domain([0, dataPause.length]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scale.linear().domain([0, 1.1*(max)]).range([h, 0]);
      // automatically determining max range can work something like this
      // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var linePause = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(dataPause,i) { 
        // return the X coordinate where we want to plot this datapoint
        return x(i); 
      })
      .y(function(dataPause) { 
        
        // return the Y coordinate where we want to plot this datapoint
        return y(dataPause); 
      });

    var lineRestart = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(dataRestart,i) { 
        // return the X coordinate where we want to plot this datapoint
        return x(i); 
      })
      .y(function(dataRestart) { 
        
        // return the Y coordinate where we want to plot this datapoint
        return y(dataRestart); 
      });

      /*VOLUME var lineVolume = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(dataVolumeChanges,i) { 
        // return the X coordinate where we want to plot this datapoint
        return x(i); 
      })
      .y(function(dataVolumeChanges) { 
        
        // return the Y coordinate where we want to plot this datapoint
        return y(dataVolumeChanges); 
      });*/


      // Add an SVG element with the desired dimensions and margin.

      // create yAxis
      var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
      // Add the x-axis.
      graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);


      // create left yAxis
      var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
      // Add the y-axis to the left
      graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);
      
        // Add the line by appending an svg:path element with the data line we created above
      // do this AFTER the axes above so that the line is above the tick-lines
      graph.append("svg:path").attr("d", linePause(dataPause)).style("stroke", "red");
      graph.append("svg:path").attr("d", linePause(dataRestart)).style("stroke", "darkgreen");
      //VOLUME graph.append("svg:path").attr("d", linePause(dataVolumeChanges)).style("stroke", "orange");
  });
  }