let mapType

// Themes For OpenStreetMap
const themes = [
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
];

// Coordinates Of Center Of Victoria
const victoria = [48.4284, -123.3656];

// Declare Map Variable
const map = L.map('map', {
    // Set Minimum Zoom Value
    minZoom: 12
})

// Set The Map Theme
L.tileLayer(themes[2], {
    // Set Maximum Zoom For Map
    maxZoom: 19,
})
// Add tileLayer To Map
.addTo(map);

// Create Variable To Store Map Markers
const markerLayer = L.layerGroup().addTo(map);

const updateMap = {
    postReq: function (url) {
        return new Promise(async resolve => {
            // Make Request
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                // Send Map Bounds
                body: JSON.stringify({mapBounds: map.getBounds()})
            });
            // Parse Json
            const json = await response.json();
            // Return Data
            resolve({response, json});
        })
    },

    positions: async function () {
        // Fetch Data
        const data = await this.postReq('/map/points/buses');

        // Reset Markers
        markerLayer.clearLayers();

        // Loop Through Data
        for(const bus of data.json){
            const position = [bus.lat, bus.lng];

            // Create Marker
            const marker = L.marker(position, {id: bus.vehicle_id}).addTo(markerLayer);

            // add Event Listener
            marker.on('click', function() {
                panelSet.upcomingStops(bus.vehicle_id);
                goTo.bus(bus.vehicle_id);
            });
        }
    },

    stops: async function () {
        // Fetch Data
        const data = await this.postReq('/map/points/stops'); 

        // Reset Markers
        markerLayer.clearLayers();

        // Loop Through Data
        for(const stop of data.json){
            const position = [stop.lat, stop.lng];

            // Create Marker
            const marker = L.marker(position, {id: stop.id, code: stop.code}).addTo(markerLayer);

            // Add Event Listener
            marker.on('click', function() {
                panelSet.upcomingBuses(stop.id);
                console.log(stop.code);
                map.flyTo(position, 19);
            });
        }
    }
}

const goTo = {
    stop: (stopCode) => {
        return new Promise(async resolve => {
            const data = await fetch(`/data/stop/${stopCode}`);
            const json = await data.json();
            const position = [json.lat, json.lng];
            resolve(json);
            map.flyTo(position, 19);
        })
    },

    bus: (vehicleId) => {
        return new Promise(async resolve => {
            const data = await fetch(`/data/position/${vehicleId}`);
            const json = await data.json();
            const position = [json.lat, json.lng];
            resolve(json);
            map.flyTo(position, 19);
        })
    }
}

const panelSet = {
    upcomingBuses: async function (stopId) {
        const response = await fetch(`/map/upcoming/buses/${stopId}`);
        const html = await response.text();
        document.getElementById('bus-results').innerHTML = html
    },

    upcomingStops: async function (vehicleId) {
        const response = await fetch(`/map/upcoming/stops/${vehicleId}`);
        const html = await response.text();
        document.getElementById('bus-results').innerHTML = html
    }
}

async function searchEnter(){
    if(mapType == 0){
        const searchBarText = document.getElementById('searchBar-text').value;
        const stopData = await goTo.stop(searchBarText);
        panelSet.upcoming(stopData.id);
    }
    else if(mapType == 1){

    }
}


// Add Event Listeners To Map
map.on('dragend zoomend load', function() {
    if(mapType == 0){
        updateMap.stops();
    }
    else if(mapType == 1){
        updateMap.positions();
    }
});

// Set Map View
map.setView(
    victoria, 
    16,
);

function changeMapType(type){
    mapType = type;
    if(mapType == 0){
        updateMap.stops();
    }
    else if(mapType == 1){
        updateMap.positions();
    }
}