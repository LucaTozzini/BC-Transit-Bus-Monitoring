import db from "./database-pool.helpers.js";
import beginTransaction from "./sql/beginTransaction.helpers.js";
import commitToDatabase from "./sql/commit-to-database.helpers.js";
import renameTable from "./sql/renameTable.helpers.js";
import dropTable from "./sql/dropTable.helpers.js";
import insertRow from "./sql/insertRow.helpers.js";
import gtfsPosition from './gtfs-position.helpers.js';
import gtfsTrip from "./gtfs-trip.helpers.js";

function setUpPositions(){
    return new Promise(resolve => {
        db.run(
            `CREATE TABLE IF NOT EXISTS gtf_positions_tmp(
                id INT,
                provider TEXT,
                trip_id INT,
                route_id INT,
                lat REAL,
                lng REAL,
                bearing INT,
                time INT,
                vehicle_id INT,
                stop_id INT, 
                stop_sequence INT, 
                status INT,
                occupancy INT
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
            `CREATE TABLE IF NOT EXISTS gtf_trips_tmp(
                id INT,
                provider TEXT,
                trip_id INT,
                route_id INT,
                stop_sequence INT,
                arrival_time INT,
                stop_id INT
            )`, 
            (err) => {
                if(err){
                    console.error(err.message);
                    resolve(500)
                }
                resolve(200);
            }
        )
    })
}

async function save(){
    try{            
        // Fetch Data From BC Transit
        const positions = await gtfsPosition();
        const trips = await gtfsTrip();
       
        // Begin Trasaction
        await beginTransaction(db);

        // Set Up Table
        await dropTable(db, 'gtf_positions_tmp');
        await dropTable(db, 'gtf_trips_tmp');
        if(await setUpPositions() == 500 || await setUpTrips() == 500){
            throw new Error('Error Creating Tables');
        }

        // Filter Position Data
        const positionData = positions.map((bus) => [
            parseInt(bus.id),
            bus.provider,
            parseInt(bus.vehicle.trip.tripId),
            parseInt(bus.vehicle.trip.routeId),
            parseFloat(bus.vehicle.position.latitude),
            parseFloat(bus.vehicle.position.longitude),
            parseInt(bus.vehicle.position.bearing),
            parseInt(bus.vehicle.timestamp.low),
            parseInt(bus.vehicle.vehicle.id),
            bus.vehicle.stopId > 0 ? parseInt(bus.vehicle.stopId) : null,
            parseInt(bus.vehicle.currentStopSequence),
            parseInt(bus.vehicle.currentStatus),
            parseInt(bus.vehicle.occupancyStatus)
        ]);

        // Prepare Position Insertion
        const posPrep = db.prepare(`INSERT INTO gtf_positions_tmp(id, provider, trip_id, route_id, lat, lng, bearing, time, vehicle_id, stop_id, stop_sequence, status, occupancy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        // Loop Through Position Data
        for(const position of positionData){
            // Insert Positions Into Table
            await insertRow(posPrep, position);
        }
        
        // Filter Trips Data
        let tripsData = []

        for(const trip of trips){
            for(const stop of trip.tripUpdate.stopTimeUpdate){
                tripsData.push([
                    parseInt(trip.id),
                    trip.provider,
                    parseInt(trip.tripUpdate.trip.tripId),
                    parseInt(stop.stopSequence),
                    stop.arrival ? parseInt(stop.arrival.time.low) : null,
                    parseInt(stop.stopId)
                ])
            }
        }

        // Prepare Trips Insertion
        const tripsPrep = db.prepare(`INSERT INTO gtf_trips_tmp(id, provider, trip_id, stop_sequence, arrival_time, stop_id) VALUES (?, ?, ?, ?, ?, ?)`);

        // Loop Through Trips Data
        for(const trip of tripsData){
            await insertRow(tripsPrep, trip);
        }

        // Switch Tables
        await renameTable(db, 'gtf_positions', 'gtf_positions_backup');
        await renameTable(db, 'gtf_positions_tmp', 'gtf_positions');
        await dropTable(db, 'gtf_positions_backup');
        
        await renameTable(db, 'gtf_trips', 'gtf_trips_backup');
        await renameTable(db, 'gtf_trips_tmp', 'gtf_trips');
        await dropTable(db, 'gtf_trips_backup');

        // Commit Database
        await commitToDatabase(db);

        // Return Created Status
        return {status: 201};
    }

    // If An Error Occurs
    // Return Internal Server Error Status
    catch(err){
        console.error(345, err);
        db.run(`ROLLBACK`, (err) => {
            if(err){
                console.error(err);
            }
        });
        return {status: 500};
    }
}

async function updateGtfsrt(seconds){
    await save();
    setTimeout(() => {

        updateGtfsrt(seconds);
    }, seconds * 1000);
}

export default updateGtfsrt;