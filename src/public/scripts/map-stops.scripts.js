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


const busStops = L.layerGroup().addTo(map)

map.on('dragend zoomend load', function() {
    updateMap()
});

map.setView(
    victoriaCoordinates, 
    16,
);

async function updateMap(){
    const stops = await fetch('/map/points/stops', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mapBounds: map.getBounds(),
        })
      }
    );
    const stopsJson = await stops.json();
    busStops.clearLayers();
    for(const stop of stopsJson){
        const marker = L.marker([stop.lat, stop.lng], {id: stop.id, code: stop.code}).addTo(busStops);
        marker.on('click', function() {
            goTo.stop(stop.code);
            panelSet.upcoming(stop.id);
        });
    }
}

const goTo = {
    stop: async (stopCode) => {
        const data = await fetch(`/data/stop/${stopCode}`);
        const json = await data.json();
        const position = [json.lat, json.lng];
        map.flyTo(position, 19);
        return json
    }
}

const panelSet = {
    upcoming: async (stopId) => {
        const response = await fetch(`/map/upcoming/buses/${stopId}`);
        const html = await response.text();
        console.log(html);
        document.getElementById('bus-results').innerHTML = html
    }
}

async function searchEnter(){
    const searchBarText = document.getElementById('searchBar-text').value;
    const stopData = await goTo.stop(searchBarText);
    panelSet.upcoming(stopData.id)
}