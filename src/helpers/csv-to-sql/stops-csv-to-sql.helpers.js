import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

function stopsCsvToSql(stopsTxt){
    return new Promise(resolve => {
        console.log('stopsCsvToSql Start')
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
            db.run(`DELETE FROM stops`, (err) => {
                if(err){
                    console.error(err.message);
                }
                
                csvtojson().fromFile(stopsTxt).then(async json => {
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

                    let i = 0;
                    for(const stop of json){
                        i++;
                        console.log(i, '/', json.length);
                        await new Promise(resolve => {
                            const {id, code, name, lat, lng} = stop;
                            db.run(`INSERT INTO stops (id, code, name, lat, lng) VALUES (?, ?, ?, ?, ?)`, [id, code, name, lat, lng], (err) => {
                                if(err){
                                    console.error(err.message);
                                }
                                resolve()
                            })
                        })
                    }
                    resolve();
                })
            })
        })                                                                   
    })
}

export default stopsCsvToSql;