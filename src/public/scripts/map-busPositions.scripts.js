const themes = [
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
];

const victoriaCoordinates = [48.4284, -123.3656]

const map = L.map('map', {
    // minZoom: 13
})

L.tileLayer(themes[2], {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


const buses = L.layerGroup().addTo(map)

map.on('dragend zoomend load', function() {
    updateMap()
});

map.setView(
    victoriaCoordinates, 
    16,
);

async function updateMap(){
    const busPositions = await fetch('/map/points/buses', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mapBounds: map.getBounds(),
        })
      }
    );
    const json = await busPositions.json();
    buses.clearLayers();
    for(const bus of json){
        const marker = L.marker([bus.lat, bus.lng], {id: bus.vehicle_id}).addTo(buses);
        marker.on('click', function() {
            
        });
    }
}

const goTo = {
    bus: async (vehicleId) => {
        
    }
}

const panelSet = {
    upcoming: async (vehicleId) => {
        
    }
}

async function searchEnter(){
    
}