import db from '../database-pool.helpers.js';

import dropTable from '../sql/dropTable.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import insertRow from '../sql/insertRow.helpers.js';
import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';

function createStopsTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS stops_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE stops_tmp (id INT, provider TEXT, code INT, name TEXT, lat REAL, lng REAL)`, (err) => {
                if(err){
                    console.error(err.message);
                }
                resolve();
            })
        })
    })
}

async function stopsCsvToSql(json){
    // Create Table
    await createStopsTable();

    // Begin SQL Transaction
    await beginTransaction(db);

    // Prepare Table Insertion
    const prep = db.prepare(`INSERT INTO stops_tmp (id, provider, code, name, lat, lng) VALUES (?, ?, ?, ?, ?, ?)`);
            
    // Loop Through Data
    for(const stop of json){
        await insertRow(prep, stop);
    }                               
    
    // Commit Database
    await commitToDatabase(db);

    // Rename Tables
    await renameTable(db, 'stops', 'stops_backup');
    await renameTable(db, 'stops_tmp', 'stops');

    // Drop Uneeded Table
    await dropTable(db, 'stops_backup');
}

export default stopsCsvToSql;