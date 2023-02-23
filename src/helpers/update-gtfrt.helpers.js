import openDatabase from "./open-database.helpers.js";

import gtfPosition from './gtf-position.helpers.js';
import gtfTrip from "./gtf-trip.helpers.js";

const db = openDatabase();

function setUpPositions(){
    return new Promise(resolve => {
        db.run(
            `CREATE TABLE IF NOT EXISTS gtf_positions(
                id INTEGER PRIMARY KEY,
                trip_id INT,
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

function setUpTrips(){
    return new Promise(resolve => {
        db.run(
            `CREATE TABLE IF NOT EXISTS gtf_trips(
                id,
                trip_id INT,
                stop_sequence INT,
                arrival_time INT,
                stop_id INT
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

async function save(){
        try{
            // Fetch Data From BC Transit
            const positions = await gtfPosition();
            const trips = await gtfTrip();
            
            // Set Up Table
            const posTable = await setUpPositions();
            const triTable = await setUpTrips();

            // If Table Set Up Fails
            // Throw Error
            if(posTable == 500 || triTable == 500){
                throw new Error();
            }

            // Reset Positions Table
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
                        $trip_id: bus.vehicle.trip.tripId,
                        $lat: bus.vehicle.position.latitude, 
                        $lng: bus.vehicle.position.longitude, 
                        $time: bus.vehicle.timestamp, 
                        $vehicle_id: bus.vehicle.vehicle.id,
                        $stop_id: bus.vehicle.stopId,
                        $stop_sequence: bus.vehicle.currentStopSequence,
                        $status: bus.vehicle.currentStatus
                    };
    
                    // Insert Data Into Database
                    db.run(`INSERT INTO gtf_positions(id, trip_id, lat, lng, time, vehicle_id, stop_id, stop_sequence, status) VALUES ($id, $trip_id, $lat, $lng, $time, $vehicle_id, $stop_id, $stop_sequence, $status)`, busData, (err) => {
                        if(err){
                            console.error(err.message);
                        }
                    })
                }
            });

            // Reset Trips Table
            db.run('DELETE FROM gtf_trips', (err) => {
                if(err){
                    console.error(err.message);
                }
                
                // Loop Through Trip Data
                for(const trip of trips.entity){

                    // Loop Through StopTimeUpdate
                    for(const stop of trip.tripUpdate.stopTimeUpdate){
                        try{
                            // Filter Data
                            const tripData = {
                                $id: parseInt(trip.id),
                                $trip_id: parseInt(trip.tripUpdate.trip.tripId),
                                $stop_sequence: parseInt(stop.stopSequence),
                                $arrival_time: parseInt(stop.arrival.time.low),
                                $stop_id: parseInt(stop.stopId)
                            }
                            db.run(`INSERT INTO gtf_trips(id, trip_id, stop_sequence, arrival_time, stop_id) VALUES ($id, $trip_id, $stop_sequence, $arrival_time, $stop_id)`, tripData, (err) => {
                                if(err){
                                    console.error(err.message);
                                }
                            })
                        }
                        catch{
                            continue
                        }
                    }
                }
            });
        }
        catch(err){
            console.error(err.message);
        }
}

async function updateGtfrt(seconds){
    save();
    setTimeout(() => {
        updateGtfrt(seconds);
    }, seconds * 1000);
}

export default updateGtfrt;