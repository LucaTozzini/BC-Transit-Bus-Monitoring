import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import insertRow from '../sql/insertRow.helpers.js';

const db = openDatabase();

function createRoutesTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS routes_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE routes_tmp (id INTEGER PRIMARY KEY, provider TEXT, short_name INT, name TEXT, color)`, (err) => {
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
                    route_id, 
                    route_short_name,
                    route_long_name,
                    route_color
                }) => ([
                    parseInt(route_id), 
                    provider,
                    parseInt(route_short_name),
                    route_long_name,
                    route_color
                ])
            );

            resolve(json)
        })
    })
}

async function routesCsvToSql(csv, provider){
    // Create Table
    await createRoutesTable();

    // Parse And Filter Csv
    const json = await getJson(csv, provider);
    
    // Prepare Table For Insertion
    const prep = db.prepare(`INSERT INTO routes_tmp (id, provider, short_name, name, color) VALUES (?, ?, ?, ?, ?)`);
    
    // Begin SQL Transaction
    await beginTransaction(db);

    // Loop Through Data
    for(const route of json){
        // Insert Into Table
        await insertRow(prep, route);
    }

    // Commit Database
    await commitToDatabase(db);

    // Rename Tables
    await renameTable(db, 'routes', 'routes_backup');
    await renameTable(db, 'routes_tmp', 'routes');

    // Drop Uneeded Table
    await dropTable(db, 'routes_backup');

    return;                                                               
}

export default routesCsvToSql;