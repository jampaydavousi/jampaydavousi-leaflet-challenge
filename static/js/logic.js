// Put API endpoint inside queryUrl
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the informtaion from API and put the json in 'data'
d3.json(queryURL, (data) => {

  // Create a log of the arrays, and put the data into the function createFeatures
  console.log(data.features);
  createFeatures(data.features);
});


// Create color bins for different earthquake magnitudes using information from https://leafletjs.com/examples/choropleth/
function getColor(c)
{
  return c > 5 ? '#ff6600' :
	       c > 4 ? '#ff8c2c' :
	       c > 3 ? '#ffb62c' :
	       c > 2 ? '#ffe12c' :
	       c > 1 ? '#fdff2c' :
         c > 0 ? '#f8f9aa' :
                 '#ffffff' ;
}

// Create function to create dynamic circles based on size of the earthquakes
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJson(earthquakeData,{
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag*5,
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9})
        .bindPopup("<h3>" + "Location: " + feature.properties.place +
          "</h3><hr><p>" + "Date/Time: " + new Date (feature.properties.time) + "<br>" +
          "Magnitude: " + feature.properties.mag + "</p>");
  }
});

  // Send earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Add legend information using the leaflet code at https://leafletjs.com/examples/choropleth/

// Must ALSO update the style.css file with informaiton at https://leafletjs.com/examples/choropleth/
// so that the color palette is displayed with the legend.
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels = [];

    for (var i = 0; i < grades.length; i++)
    {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    console.log('div' + div);
  return div;
};

function createMap(earthquakes) {
  // Get base map layer
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  })
  //Get dark map layer
  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  })

  // Define baseMaps 
  var baseMaps = {
    "Light": lightmap,
    "Dark": darkmap
  };

  // Create overlay layer for overlay objects: earthquakes
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create combined map
  var myMap = L.map("map", {
    center: [40.75, -111.87],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });
    console.log(myMap);

//   Add aseMaps and overlayMaps to combined map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
   }).addTo(myMap);

  //Add legend to myMap
  legend.addTo(myMap);
}