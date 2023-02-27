import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

function tripsCsvToSql(tripsTxt){
    return new Promise(resolve => {
        console.log('tripsCsvToSql Start')
        const db = openDatabase();
        
        db.run(`
            CREATE TABLE trips(
                id INTEGER PRIMARY KEY,
                service_id INT,
                route_id INT,
                headsign TEXT
            )`, 
            (err) => {
                if(err){
                    console.error(err.message);
                }
                db.run(`DELETE FROM trips`, (err) => {
                    if(err){
                        console.error(err.message);
                    }
                    
                    csvtojson()
                    .fromFile(tripsTxt)
                    .then(async json => {
                        json = json.map(
                            ({
                                trip_id,
                                service_id,
                                route_id, 
                                trip_headsign
                            }) => ({
                                id: parseInt(trip_id),
                                service_id: parseInt(service_id),
                                route_id: parseInt(route_id), 
                                headsign: trip_headsign
                            })
                        );

                        let i = 0
                        for(const trip of json){
                            i++;
                            console.log(i, '/', json.length);

                            await new Promise(resolve => {
                                const {id, service_id, route_id, headsign} = trip;
                                db.run(`INSERT INTO trips (id, service_id, route_id, headsign) VALUES (?, ?, ?, ?)`, [id, service_id, route_id, headsign], (err) => {
                                    if(err){
                                        console.error(err.message);
                                    }
                                    resolve()
                                })
                            })
                        }
                        resolve()
                    })
                })
            }
        )                                                                   
    })
}

export default tripsCsvToSql;