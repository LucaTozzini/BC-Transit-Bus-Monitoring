import csvtojson from 'csvtojson';
import openDatabase from './open-database.helpers.js';

const stopsTxt = 'C:/Users/luca_/OneDrive/Desktop/bus_ml_api/data/stops.txt';
const db = openDatabase()
db.run(`CREATE TABLE stops(
    id INTEGER PRIMARY KEY,
    code TEXT,
    name TEXT,
    lat REAL,
    lng REAL
)`, (err) => {
    if(err){
        console.error(err.message);
    }
    csvtojson().fromFile(stopsTxt).then(json => {
        json = json.map(({
            stop_id, 
            stop_code, 
            stop_name, 
            stop_lat, 
            stop_lon
        }) => ({
            id: parseInt(stop_id), 
            code: parseInt(stop_code), 
            name: stop_name, 
            lat: parseFloat(stop_lat), 
            lng: parseFloat(stop_lon)
        }));
        for(const stop of json){
            console.log('saving', stop.name);
            const {id, code, name, lat, lng} = stop;
            db.run(`INSERT INTO stops (id, code, name, lat, lng) VALUES (?, ?, ?, ?, ?)`, [id, code, name, lat, lng], (err) => {
                if(err){
                    console.error(err.message);
                }
            })
        }
    })
})                                                                   