let mapType, locationInitialized = false;

// Themes For OpenStreetMap
const themes = [
    ['https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', ''],
    ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', ''],
    ['https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'],
    ['https://tile.openstreetmap.org/{z}/{x}/{y}.png', '']
];

// Coordinates Of Center Of Victoria
const victoria = [48.4284, -123.3656];

// Declare Map Variable
const map = L.map('map', {
    // Set Minimum Zoom Value
    minZoom: 12
})

// Set The Map Theme
const tileLayer = L.tileLayer(themes[2][0], {
    // Credit Map Maker
    // attribution: themes[2][1],
    // Set Maximum Zoom For Map
    maxZoom: 22,
})
// Add tileLayer To Map
.addTo(map);

/* Default marker icon */
const defaultIcon = {
    stop: L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Map_pin_icon.svg/1504px-Map_pin_icon.svg.png',
        iconSize: [30,  40],
        iconAnchor: [15, 40]
    }),

    bus: L.icon({
        iconUrl: '/img/bus.svg',
        iconSize: [70,  70],
        iconAnchor: [35, 35],
    })
}

/* Larger marker icon for smaller screens */
const mobileIcon = {
    stop: L.icon({
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Map_pin_icon.svg/1504px-Map_pin_icon.svg.png',
        iconSize: [90,  120],
        iconAnchor: [45, 120]
    }),

    bus: L.icon({
        iconUrl: 'img/bus.svg',
        iconSize: [140,  140],
        iconAnchor: [70, 70]
    }),
}

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
            const marker = L.marker(position, {id: bus.vehicle_id}).addTo(markerLayer)
            .setIcon(isMobile ? mobileIcon.bus : defaultIcon.bus);

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
            const marker = L.marker(position, {id: stop.id, code: stop.code}).addTo(markerLayer)
            // Set Icon
            .setIcon(isMobile ? mobileIcon.stop : defaultIcon.stop);

            // Add Event Listener
            marker.on('click', function() {
                panelSet.upcomingBuses(stop.code);
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
    setLoading: function(){
        document.getElementById('dynamic-results').innerHTML = `
            <img class="loading-img" src='https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif'>
        `
    },

    hideSearchBar: function(){
        document.getElementById('searchBar').style.display = 'none';
    },

    upcomingBuses: async function (stopCode) {
        this.setLoading();
        this.hideSearchBar();
        
        const response = await fetch(`/map/upcoming/buses/${stopCode}`);
        const html = await response.text();
        
        document.getElementById('sidePanel').classList.add("expand");
        document.getElementById('dynamic-results').innerHTML = html
    },

    upcomingStops: async function (vehicleId) {
        this.setLoading();
        this.hideSearchBar();
        
        const response = await fetch(`/map/upcoming/stops/${vehicleId}`);
        const html = await response.text();
        
        document.getElementById('sidePanel').classList.add("expand");
        document.getElementById('dynamic-results').innerHTML = html
    },

    clear: () => {
        document.getElementById('searchBar').style.display = 'flex';
        document.getElementById('sidePanel').classList.remove("expand");
        document.getElementById('dynamic-results').innerHTML = '';
    }
}

async function searchEnter(){
    const searchBarText = document.getElementById('searchBar-text').value;
    if(mapType == 0){
        goTo.stop(searchBarText);
        panelSet.upcomingBuses(searchBarText);
    }
    else if(mapType == 1){
        goTo.bus(searchBarText);
        panelSet.upcomingStops(searchBarText);
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

// Set Initial Map View
map.setView(
    victoria, 
    16,
);

function setMapType(type){
    // Clear Side Panel If New Type Is Set
    if(mapType != type){
        panelSet.clear()
    }

    // Save New Type To Memory
    mapType = type;

    // Update Map
    if(mapType == 0){
        document.getElementById('searchBar-text').placeholder = 'Search Stop Code...'
        updateMap.stops();
    }
    else if(mapType == 1){
        document.getElementById('searchBar-text').placeholder = 'Search Vehicle Id...'
        updateMap.positions();
    }
}




// get the user's location and show it on the map
const userMarker = L.marker([0,0]).addTo(map);

// get the user's location and show it on the map
navigator.geolocation.watchPosition(function(position) {
    var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
    userMarker.setLatLng(latlng);
    if(!locationInitialized){
        map.panTo(latlng);
        locationInitialized = true;
    }
    setMapType(mapType);
}, function(error) {
    // document.body.innerHTML = error.message;
}, {
    enableHighAccuracy: true,  // use high accuracy mode if available
    maximumAge: 30000,         // maximum age of cached position data (30 seconds)
    timeout: 10000             // maximum time to wait for position data (10 seconds)
});


window.addEventListener('resize', function() {
    // tileLayer.redraw();
});
