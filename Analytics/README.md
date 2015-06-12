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

-The index.html is just a simple html file with the divisions of each part of the graphs.
-All the bootstrap css files refers to preprocessed bootstrap modules for styling and styles.css is a very simple file that changes some basic elements of that.
-Fonts refers to some external fonts loaded to make bootstrap possible.
-The bootstrap.js files refers to the general use of bootstrap as before. <br> <b>Functions.js</b> and <b>Plot.js</b> are the base of all the Analytics parts. There is heavily implemented d3.js and jQuery to make an interactive visualization of the data. The main functions used are d3.json (load json files) and some jQuery tabs logics, along different methods of plotting and organizing information.

#Graphs and Analysis


