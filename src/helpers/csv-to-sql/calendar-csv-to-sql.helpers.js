import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import insertRow from '../sql/insertRow.helpers.js';

const db = openDatabase();

function createCalendarTable(){
    return new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS calendar_tmp (service_id INTEGER PRIMARY KEY, monday INT, tuesday INT, wednesday INT, thursday INT, friday INT, saturday INT, sunday INT)`, (err) => {
            if(err){
                console.error(err.message);
            }
            resolve()
        })
    })
}

function getJson(csv){
    return new Promise(resolve => {
        csvtojson().fromFile(csv).then(async json => 
            {
                json = json.map(
                    ({
                        service_id,
                        monday,
                        tuesday,
                        wednesday,
                        thursday,
                        friday,
                        saturday,
                        sunday
                    }) => ([
                        parseInt(service_id),
                        parseInt(monday),
                        parseInt(tuesday),
                        parseInt(wednesday),
                        parseInt(thursday),
                        parseInt(friday),
                        parseInt(saturday),
                        parseInt(sunday)
                    ])
                );
                resolve(json)
            }
        )
    })
}

async function calendarCsvToSql(csv){
        // Create Tmp Table
        await createCalendarTable();
        
        // Begin Transaction
        await beginTransaction(db);
        
        // Prepare Table for Insertion
        const prep = db.prepare(`INSERT INTO calendar_tmp(service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

        // Get Json From Csv
        const json = await getJson(csv);

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
        await dropTable(db, 'calendar_tmp');

        return;
}

export default calendarCsvToSql;