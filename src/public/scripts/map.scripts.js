const themes = [
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
];

const victoriaCoordinates = [48.4284, -123.3656]

const map = L.map('map', {
    minZoom: 13
}).setView(
    victoriaCoordinates, 
    16,
);

L.tileLayer(themes[0], {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


const busStops = L.layerGroup().addTo(map)

map.on('dragend zoomend', function() {
    updateMap()
});

async function updateMap(){
    const stops = await fetch('/data/points', {
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
        L.marker([
            stop.lat, 
            stop.lng
        ], {
            id: stop.id,
            code: stop.code
        }).addTo(busStops);
    }
}

const goTo = {
    stop: async (code) => {
        const data = await fetch(`/data/stop?stopCode=${code}`);
        const json = await data.json();
        const position = [json.lat, json.lng];
        map.flyTo(position, 19);
    }
}

function searchEnter(){
    const searchBarText = document.getElementById('searchBar-text').value;
    goTo.stop(searchBarText)
}