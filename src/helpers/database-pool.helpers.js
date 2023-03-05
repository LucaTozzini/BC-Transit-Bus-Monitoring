import sqlite3 from 'sqlite3';

import env from '../../env.js';

const dbPath = env.DATABASE_FILE;

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        return console.error(err.message);
    }
})

export default db;