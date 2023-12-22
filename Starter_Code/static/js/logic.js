// Create map and set initial view
var map = L.map('map').setView([0, 0], 2);

// Add a tile layer
var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Replace this URL with the URL of the earthquake data JSON
var earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

// Create a legend control for depth
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var depths = [0, 70, 300]; // Define depth ranges
    var colors = ['#8B0000', '#FFFF00', '#00FFFF']; // Corresponding colors
    var labels = [];

    div.innerHTML += '<h4>Legend</h4>';
    div.innerHTML += '<p><strong>Depth</strong></p>';

    // Loop through depth ranges to create legend labels
    for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            '<span>' +
            (i === 0 ? 'Shallow (&lt; ' + depths[i] + ' km)' : (i === depths.length - 1 ? 'Deep (&gt; ' + depths[i] + ' km)' : 'Intermediate (' + depths[i] + '-' + depths[i + 1] + ' km)')) +
            '</span><br>';
    }

    return div;
};

legend.addTo(map);

// Fetch earthquake data from the URL using D3
d3.json(earthquakeDataUrl)
    .then(data => {
        data.features.forEach(feature => {
            var coords = feature.geometry.coordinates;
            var magnitude = feature.properties.mag;
            var depth = coords[2]; // Depth is the third coordinate in the array
            var title = feature.properties.title;

            // Determine marker size based on earthquake magnitude
            var markerSize = magnitude * 5;

            // Calculate depth-based color using a gradient
            var depthColors = d3.scaleLinear()
                .domain([0, 70, 300]) // Depth ranges
                .range(['#8B0000', '#FFFF00', '#00FFFF']) // Corresponding colors

            var markerColor = depthColors(depth);

            // Create circle markers on the map based on earthquake properties
            L.circleMarker([coords[1], coords[0]], {
                radius: markerSize,
                fillColor: markerColor,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            })
            .bindPopup('Magnitude: ' + magnitude + '<br>Depth: ' + depth + ' km<br>Location: ' + title)
            .addTo(map);
        });
    })
    .catch(error => {
        console.error('Error fetching earthquake data:', error);
    });


