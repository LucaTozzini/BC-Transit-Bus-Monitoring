import db from '../database-pool.helpers.js';

import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import insertRow from '../sql/insertRow.helpers.js';

function createCalendarTable(){
    return new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS calendar_tmp (service_id INT, provider TEXT, monday INT, tuesday INT, wednesday INT, thursday INT, friday INT, saturday INT, sunday INT)`, (err) => {
            if(err){
                console.error(err.message);
            }
            resolve()
        })
    })
}

async function calendarCsvToSql(json){
    // 
    await dropTable(db, 'calendar_tmp');
    
    // Create Tmp Table
    await createCalendarTable();
    
    // Begin Transaction
    await beginTransaction(db);
    
    // Prepare Table for Insertion
    const prep = db.prepare(`INSERT INTO calendar_tmp(service_id, provider, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // Loop Through Data
    for(const service of json){
        // Insert Into Table
        await insertRow(prep, service);
    }
    
    // Commit Database
    await commitToDatabase(db);

    // Rename Tables
    await renameTable(db, 'calendar', 'calendar_backup');
    await renameTable(db, 'calendar_tmp', 'calendar');

    // Drop Uneeded Tables
    await dropTable(db, 'calendar_backup');

    return;
}

export default calendarCsvToSql;