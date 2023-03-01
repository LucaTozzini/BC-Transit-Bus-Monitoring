import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

import dropTable from '../sql/dropTable.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import insertRow from '../sql/insertRow.helpers.js';
import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';

const db = openDatabase()

function createStopsTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS stops_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE stops_tmp (id INTEGER PRIMARY KEY, code INT, name TEXT, lat REAL, lng REAL)`, (err) => {
                if(err){
                    console.error(err.message);
                }
                resolve();
            })
        })
    })
}

function getJson(csv){
    return new Promise(resolve => {
        csvtojson().fromFile(csv).then(async json => {
            json = json.map(
                ({
                    stop_id, 
                    stop_code, 
                    stop_name, 
                    stop_lat, 
                    stop_lon
                }) => ([
                    parseInt(stop_id), 
                    parseInt(stop_code), 
                    stop_name, 
                    parseFloat(stop_lat), 
                    parseFloat(stop_lon)
                ])
            );
            resolve(json);
        })
    })
}

async function stopsCsvToSql(csv){
    // Create Table
    await createStopsTable();

    // Parse And Filter Csv
    const json = await getJson(csv);

    // Begin SQL Transaction
    await beginTransaction(db);

    // Prepare Table Insertion
    const prep = db.prepare(`INSERT INTO stops_tmp (id, code, name, lat, lng) VALUES (?, ?, ?, ?, ?)`);
            
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