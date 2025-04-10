// create the tile layers for the backgrounds of the map
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// grayscale layer
var grayscale = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});



// detailed layer
var detail = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// make basemaps object
let basemaps = {
    GrayScale: grayscale,
    Detailed: detail,
    Default: defaultMap
};

// make a map object
var myMap = L.map("map", {
    center: [34.0549, -118.2426],
    zoom: 5,
    layers: [defaultMap, grayscale, detail]
});

// add the default map to the map
defaultMap.addTo(myMap);

//create the info for the overlay for the earthquakes
let earthquakes = new L.layerGroup();

//get the data for the earthquakes and populate the layer group
// call the USGS GeoJson API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    function(earthquakeData){
        // confirm data is loaded
        //console.log(earthquakeData);
        //plot circles, where the radius is dependent on magnitude
        //color dependent on depth

        // make a function that choose color of data
        function chooseColor(depth){
            if (depth > 90)
                return "red";
            else if(depth > 70)
                return "#f74402";
            else if(depth > 50)
                return "#f77402";
            else if(depth > 30)
                return "#f7a902";
            else if(depth > 10)
                return "#def702";
            else  
                return "green";
        }

        // make a function that will determine circle size
        function radSize(mag){
            if (mag == 0)
                return 1; //makes sure a 0 mag earthquake shows up
            else
                return mag *5; // make sure that circle is pronounced in the map
        }

        // add on to the style 
        function dataStyle(feature)
        {
            return {
                opacity: 1,
                fillOpacity: .5,
                fillColor: chooseColor(feature.geometry.coordinates[2]), //depth is second index
                color: "00000",
                radius: radSize(feature.properties.mag), //gets magnitude of earthquake
                weight: 0.5,
                stroke: true
            }
        }

        // add the GeoJson Data
        L.geoJson(earthquakeData, {
            // make each feature a marker on the map, each marker is a circle
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            // set the style for each marker
            style: dataStyle,
            //add popups
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes);
    }

);

//add the earthquake layer to the map
earthquakes.addTo(myMap);
//create the overlay for the earthquakes
let overlays = {
    "Earthquake Data":  earthquakes
};




//add the layer control

L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

//add the legend to the map
let legend = L.control({
    position: "bottomright"
});
// add the properties for the legend
legend.onAdd = function(){
    // div for the legend to appear in the page
    let div = L.DomUtil.create("div", "info legend");

    // set up the intervals
    let intervals = [-10,10,30,50,70,90];
    // set the colors for the intervals
    let colors = [
        "green",
        "#def702",
        "#f7a902",
        "#f77402",
        "#f74402",
        "red"
    ];
    // loop throught the intervalls and the colors
    // with a colored square for each interval
    for (var i = 0; i < intervals.length; i++)
    {
        //inner html that sets the square 
        div.innerHTML += "<li style='background-color: " 
        + colors[i] + "'></li> " 
        + intervals[i] 
        +(intervals[i+1] ? "-" + intervals[i +1] + "km<br>" : "+");
    }

    return div;
};

//add the legend to the map
legend.addTo(myMap)