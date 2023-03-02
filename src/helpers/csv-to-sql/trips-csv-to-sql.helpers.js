import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

import insertRow from '../sql/insertRow.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';

const db = openDatabase();

function createTripsTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS trips_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE trips_tmp (id INTEGER PRIMARY KEY, provider TEXT, service_id INT, route_id INT, headsign TEXT)`, (err) => {
                
                if(err){
                    console.error(err.message);
                }
                resolve();
            })
        })
    })
}

function getJson(csv, provider){
    return new Promise(resolve => {
        csvtojson().fromFile(csv).then(async json => {
            json = json.map(
                ({
                    trip_id,
                    service_id,
                    route_id, 
                    trip_headsign
                }) => ([
                    parseInt(trip_id),
                    provider,
                    parseInt(service_id),
                    parseInt(route_id), 
                    trip_headsign
                ])
            );
            resolve(json);
        })
    })
}


async function tripsCsvToSql(csv){
    //Create Table 
    await createTripsTable();
    
    // Parse And Filter Data
    const json = await getJson(csv)

    // Prepare Table For Insertion
    const prep = db.prepare(`INSERT INTO trips_tmp (id, provider, service_id, route_id, headsign) VALUES (?, ?, ?, ?, ?)`);

    // Begin SQL Transaction
    await beginTransaction(db);
                    
    // Loop Through Data
    let i = 0;
    for(const trip of json){
        i++;
        console.log(i, '/', json.length);
        // Insert Into Table
        await insertRow(prep, trip);
    }

    // Commit Database
    await commitToDatabase(db);

    // Rename Tables
    await renameTable(db, 'trips', 'trips_backup');
    await renameTable(db, 'trips_tmp', 'trips');

    // Drop Uneeded Table
    await dropTable(db, 'trips_backup');

    return;                               
}

export default tripsCsvToSql;