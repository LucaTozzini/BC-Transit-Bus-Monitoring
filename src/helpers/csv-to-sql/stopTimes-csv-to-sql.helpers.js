import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

function stopTimesCsvToSql(tripsTxt){
    return new Promise(resolve => {
        console.log('stopTimesCsvToSql Start')
        const db = openDatabase() 
        
        db.run(`
            CREATE TABLE stop_times(
                trip_id INT,
                scheduled_time TEXT,
                stop_id INT,
                stop_sequence INT
            )`, 
            (err) => {
                if(err){
                    console.error('stopTimesCsvToSql CREATE', err.message);
                }
                db.run(`DELETE FROM stop_times`, (err) => {
                    if(err){
                        console.error('stopTimesCsvToSql DELETE', err.message);
                    }
                    
                    csvtojson().fromFile(tripsTxt).then(async json => {
                        json = json.map(({
                            trip_id,
                            arrival_time, 
                            stop_id,
                            stop_sequence
            
                        }) => ({
                            trip_id: parseInt(trip_id),
                            scheduled_time: arrival_time, 
                            stop_id: parseInt(stop_id),
                            stop_sequence: parseInt(stop_sequence)
                        }));

                        let i = 0;
                        for(const stopTime of json){
                            i++;
                            console.log(i, '/', json.length);
                            await new Promise(resolve => {
                                const {trip_id, scheduled_time, stop_id, stop_sequence} = stopTime;
                                db.run(`INSERT INTO stop_times (trip_id, scheduled_time, stop_id, stop_sequence) VALUES (?, ?, ?, ?)`, [trip_id, scheduled_time, stop_id, stop_sequence], (err) => {
                                    if(err){
                                        console.error(err.message);
                                    }
                                    resolve();
                                })
                            })
                        }
                        resolve();
                    })
                })
            }
        )                                                                   
    })
}

export default stopTimesCsvToSql;