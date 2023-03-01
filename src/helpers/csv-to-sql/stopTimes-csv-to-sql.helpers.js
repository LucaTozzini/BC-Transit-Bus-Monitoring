import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

import insertRow from '../sql/insertRow.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';

const db = openDatabase();

function createStopTimesTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS stop_times_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE stop_times_tmp (trip_id INT, scheduled_time TEXT, stop_id INT, stop_sequence INT)`, (err) => {
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
                    trip_id,
                    arrival_time, 
                    stop_id,
                    stop_sequence
                }) => ([
                    parseInt(trip_id),
                    arrival_time, 
                    parseInt(stop_id),
                    parseInt(stop_sequence)
                ])
            );
            resolve(json);
        })
    })
}

async function stopTimesCsvToSql(csv){
    // Create Table
    await createStopTimesTable();

    // Parse And Filter Csv
    const json = await getJson(csv);

    // Prepare Table For Insertion
    const prep = db.prepare(`INSERT INTO stop_times_tmp (trip_id, scheduled_time, stop_id, stop_sequence) VALUES (?, ?, ?, ?)`);

    // Begin SQL Transaction
    await beginTransaction(db);

    // Loop Through Data    
    let i = 0;
    for(const stopTime of json){
        i++;
        console.log(i, '/', json.length);
        // Insert Into Table
        await insertRow(prep, stopTime);
    }

    // Commit Database
    await commitToDatabase(db);

    // Rename Tables
    await renameTable(db, 'stop_times', 'stop_times_backup');
    await renameTable(db, 'stop_times_tmp', 'stop_times');

    // Drop Uneeded Table
    await dropTable(db, 'stop_times_backup');

    return;                  
}

export default stopTimesCsvToSql;