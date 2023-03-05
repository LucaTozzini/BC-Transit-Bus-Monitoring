import db from '../database-pool.helpers.js';

import insertRow from '../sql/insertRow.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';

function createTripsTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS trips_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE trips_tmp (id INT, provider TEXT, service_id INT, route_id INT, headsign TEXT, shape_id INT)`, (err) => {
                
                if(err){
                    console.error(err.message);
                }
                resolve();
            })
        })
    })
}

async function tripsCsvToSql(json){
    //Create Table 
    await createTripsTable();
    
    // Prepare Table For Insertion
    const prep = db.prepare(`INSERT INTO trips_tmp (id, provider, service_id, route_id, headsign, shape_id) VALUES (?, ?, ?, ?, ?, ?)`);

    // Begin SQL Transaction
    await beginTransaction(db);
                    
    // Loop Through Data
    let i = 0;
    for(const trip of json){
        i++;
        if(i % 10000 == 0){
            console.log(i, '/', json.length);
        }
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