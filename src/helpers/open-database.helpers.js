import sqlite3 from 'sqlite3';

import env from '../../env.js';

const dbPath = env.DATABASE_FILE;

function openDatabase(){
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if(err){
            return console.error(err.message);
        }
    })
    return db;
}

export default openDatabase;