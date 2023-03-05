let mapType, locationInitialized = false;
const minStopsZoom = 12;
const minPosZoom = 10;

let routeToDraw = {
    queued: false,
    headsign: '',
    provider: '',
}

// Themes For OpenStreetMap
const themes = [
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
];

// Coordinates Of Center Of Victoria
const victoria = [48.4284, -123.3656];

// Declare Map Variable
const map = L.map('map', {
    // Set Minimum Zoom Value
    minZoom: 3,
    worldCopyJump: true,
});

// Set The Map Theme
const tileLayer = L.tileLayer(themes[2], {
    // Set Maximum Zoom For Map
    maxZoom: 22,
})
// Add tileLayer To Map
.addTo(map);

/* Default marker icon */
const defaultIcon = {
    stop: L.icon({
        iconUrl: 'https://i.pinimg.com/474x/e6/dd/25/e6dd258ac0b672c3645d7865cd44ce0d--bus-app-app-logo.jpg',
        iconSize: [20,  20],
        iconAnchor: [10, 10]
    }),

    bus: L.icon({
        iconUrl: 'https://www.fvsd.ab.ca/uploads/busstatusapp/1673457633-375w_busstatusapp.png',
        iconSize: [50,  50],
        iconAnchor: [25, 25],
    }),

    user: L.icon({
        iconUrl: '/img/userLocation.png',
        iconSize: [60,  60],
        iconAnchor: [30, 30],
    })
};

/* Larger marker icon for smaller screens */
const mobileIcon = {
    stop: L.icon({
        iconUrl: 'https://i.pinimg.com/474x/e6/dd/25/e6dd258ac0b672c3645d7865cd44ce0d--bus-app-app-logo.jpg',
        iconSize: [50,  50],
        iconAnchor: [25, 25]
    }),

    bus: L.icon({
        iconUrl: 'img/bus.svg',
        iconSize: [140,  140],
        iconAnchor: [70, 70]
    }),
};

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
        if(map.getZoom() <= minPosZoom){
            markerLayer.clearLayers();
            return
        };
        
        // Fetch Data
        const data = await this.postReq('/map/points/buses');
        
        // Reset Markers
        markerLayer.clearLayers();

        // Loop Through Data
        for(const bus of data.json){
            const position = [bus.lat, bus.lng];

            // Create Marker
            const marker = L.marker(position, {id: bus.vehicle_id, provider: bus.provider, headsign: bus.headsign}).addTo(markerLayer)
            .setIcon(isMobile ? mobileIcon.bus : defaultIcon.bus);

            // add Event Listener
            marker.on('click', function() {
                panelSet.upcomingStops(bus.vehicle_id, bus.provider);
                map.flyTo(position, 19);
                routeToDraw.queued = true;
                routeToDraw.headsign = bus.trip_id;
                routeToDraw.provider = bus.provider;
            });
        }
    },

    stops: async function () {
        if(map.getZoom() <= minStopsZoom){
            markerLayer.clearLayers();
            return
        };
        
        // Fetch Data
        const data = await this.postReq('/map/points/stops'); 
        
        // Reset Markers
        markerLayer.clearLayers();

        // Loop Through Data
        for(const stop of data.json){
            const position = [stop.lat, stop.lng];

            // Create Marker
            const marker = L.marker(position, {id: stop.id, code: stop.code, provider: stop.provider}).addTo(markerLayer)
            // Set Icon
            .setIcon(isMobile ? mobileIcon.stop : defaultIcon.stop);

            // Add Event Listener
            marker.on('click', function() {
                panelSet.upcomingBuses(stop.code, stop.provider);
                console.log(stop)
                map.flyTo(position, 19);
            });
        }
    }
};

const goTo = {
    stop: (stopCode, provider) => {
        return new Promise(async resolve => {
            const data = await fetch(`/data/stop/${stopCode}/${provider}`);
            const json = await data.json();
            const position = [json.lat, json.lng];
            resolve(json);
            map.flyTo(position, 19);
        })
    },

    bus: (vehicleId, provider) => {
        return new Promise(async resolve => {
            const data = await fetch(`/data/position/${vehicleId}/${provider}`);
            const json = await data.json();
            const position = [json.lat, json.lng];
            resolve(json);
            map.flyTo(position, 19);
        })
    }
};

const panelSet = {
    setLoading: function(){
        document.getElementById('dynamic-results').innerHTML = `
            <img class="loading-img" src='https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif'>
        `
    },

    hideSearchBar: function(){
        document.getElementById('searchBar').style.display = 'none';
    },

    upcomingBuses: async function (stopCode, provider) {
        this.setLoading();
        this.hideSearchBar();
        
        const response = await fetch(`/map/upcoming/buses/${stopCode}/${provider}`);
        const html = await response.text();
        
        document.getElementById('sidePanel').classList.add("expand");
        document.getElementById('dynamic-results').innerHTML = html
    },

    upcomingStops: async function (vehicleId, provider) {
        this.setLoading();
        this.hideSearchBar();
        
        const response = await fetch(`/map/upcoming/stops/${vehicleId}/${provider}`);
        const html = await response.text();
        
        document.getElementById('sidePanel').classList.add("expand");
        document.getElementById('dynamic-results').innerHTML = html
    },

    clear: () => {
        route.remove()
        document.getElementById('searchBar').style.display = 'flex';
        document.getElementById('sidePanel').classList.remove("expand");
        document.getElementById('dynamic-results').innerHTML = '';
    }
};

async function searchEnter(){
    const searchBarText = document.getElementById('searchBar-text').value;
    if(mapType == 0){
        goTo.stop(searchBarText, 'BC_Transit_Victoria');
        panelSet.upcomingBuses(searchBarText, 'BC_Transit_Victoria');
    }
    else if(mapType == 1){
        goTo.bus(searchBarText);
        panelSet.upcomingStops(searchBarText);
    }
};


// Add Event Listeners To Map
map.on('dragend zoomend load', function() {
    if(mapType == 0){
        updateMap.stops();
    }
    else if(mapType == 1){
        updateMap.positions();
    }
    if(routeToDraw.queued){
        drawRoute(routeToDraw.headsign, routeToDraw.provider);
        routeToDraw.queued = false;
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
};

// get the user's location and show it on the map
const userMarker = L.marker([0,0]).setIcon(defaultIcon.user).setZIndexOffset(1000);

const userMarkerArea = L.circle([0,0], {
    color: 'blue',
    fillColor: 'blue',
    fillOpacity: 0.1,
    opacity: 0.2,   
    radius: 50
});

// get the user's location and show it on the map
navigator.geolocation.watchPosition(function(position) {
    const latlng = L.latLng(position.coords.latitude, position.coords.longitude);

    userMarker.setLatLng(latlng).remove().addTo(map);
    userMarkerArea.setLatLng(latlng).remove().addTo(map);

    if(!locationInitialized){
        map.panTo(latlng);
        locationInitialized = true;
    }
    setMapType(mapType);

}, function(err) {
    console.error(err.message);
}, {
    enableHighAccuracy: false,  // use high accuracy mode if available
    maximumAge: 30000,         // maximum age of cached position data (30 seconds)
    timeout: 10000             // maximum time to wait for position data (10 seconds)
});


let route = L.polyline([], {
    color: '#00a6ff',
    weight: 8
})

async function drawRoute(tripId, provider){
    const data = await fetch(`map/points/route/${tripId}/${provider}`);
    const json = await data.json();
    const path = json.map(({lat, lng}) => ([lat, lng]))

    json.map(obj => {
        console.log(obj.shape_pt_sequence)
    })
    
    route.setLatLngs(path)
    .remove()
    .addTo(map);
}