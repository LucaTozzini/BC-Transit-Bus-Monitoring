import openDatabase from "./open-database.helpers.js";

import gtfPosition from './gtf-position.helpers.js';
import gtfTrip from "./gtf-trip.helpers.js";

const db = openDatabase();

function setUpPositions(){
    return new Promise(resolve => {
        db.run(
            `CREATE TABLE IF NOT EXISTS gtf_positions(
                id INTEGER PRIMARY KEY,
                lat REAL,
                lng REAL,
                time INT,
                vehicle_id INT,
                stop_id INT, 
                stop_sequence INT, 
                status INT
            )`, 
            (err) => {
                if(err){
                    console.error(err.message);
                    resolve(500);
                }
                else{
                    resolve(200)
                }
            }
        )
    })
}

function save(){
    return new Promise(async resolve => {
        try{
            //Update .bin Fro Trips
            await gtfTrip();

            // Fetch Position Data From BC Transit
            const positions = await gtfPosition();
            
            // Set Up Table
            const posTable = await setUpPositions();

            // If Table Set Up Fails
            // Throw Error
            if(posTable == 500){
                throw new Error();
            }

            // Reset Table
            db.run('DELETE FROM gtf_positions', (err) =>{
                if(err){
                    console.error(err.message);
                    return resolve(500);
                }
                // Loop Through Position Data
                for(const bus of positions.entity){
                    if(!bus.vehicle.hasOwnProperty('currentStopSequence') || !bus.vehicle.hasOwnProperty('currentStatus') || !bus.vehicle.hasOwnProperty('stopId')){
                        continue    
                    }
    
                    // Filter Data
                    const busData = {
                        $id: bus.id, 
                        $lat: bus.vehicle.position.latitude, 
                        $lng: bus.vehicle.position.longitude, 
                        $time: bus.vehicle.timestamp, 
                        $vehicle_id: bus.vehicle.vehicle.id,
                        $stop_id: bus.vehicle.stopId,
                        $stop_sequence: bus.vehicle.currentStopSequence,
                        $status: bus.vehicle.currentStatus
                    };
    
                    // Insert Data Into Database
                    db.run(`INSERT INTO gtf_positions(id, lat, lng, time, vehicle_id, stop_id, stop_sequence, status) VALUES ($id, $lat, $lng, $time, $vehicle_id, $stop_id, $stop_sequence, $status)`, busData, (err) => {
                        if(err){
                            console.error(err.message);
                        }
                    })
                }
                resolve(200)
            });

        }
        catch{
            resolve(500)
        }
    })
}

async function updateGtfrt(seconds){
    await save();
    setTimeout(() => {
        updateGtfrt(seconds);
    }, seconds * 1000);
}

export default updateGtfrt;