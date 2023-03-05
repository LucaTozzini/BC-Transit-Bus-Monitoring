import db from '../database-pool.helpers.js';

import beginTransaction from '../sql/beginTransaction.helpers.js';
import commitToDatabase from '../sql/commit-to-database.helpers.js';
import dropTable from '../sql/dropTable.helpers.js';
import renameTable from '../sql/renameTable.helpers.js';
import insertRow from '../sql/insertRow.helpers.js';

function createShapesTable(){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS shapes_tmp`, (err) => {
            if(err){
                console.error(err.message)
            }
            db.run(`CREATE TABLE shapes_tmp (id INT, provider TEXT, lat REAL, lng REAL, shape_pt_sequence INT)`, (err) => {
                if(err){
                    console.error(err.message);
                }
                resolve();
            })
        })
    })
}

async function shapesCsvToSql(json){
    // Create Table
    await createShapesTable();

    // Prepare Table For Insertion
    const prep = db.prepare(`INSERT INTO shapes_tmp (id, provider, lat, lng, shape_pt_sequence) VALUES (?, ?, ?, ?, ?)`);
    
    // Begin SQL Transaction
    await beginTransaction(db);

    // Loop Through Data
    let i = 0;
    for(const route of json){
        i++;
        if(i % 10000 == 0){
            console.log(i, '/', json.length);
        }
        // Insert Into Table
        await insertRow(prep, route);
    }

    // Commit Database
    await commitToDatabase(db);

    // Rename Tables
    await renameTable(db, 'shapes', 'shapes_backup');
    await renameTable(db, 'shapes_tmp', 'shapes');

    // Drop Uneeded Table
    await dropTable(db, 'shapes_backup');

    return;                                                               
}

export default shapesCsvToSql;