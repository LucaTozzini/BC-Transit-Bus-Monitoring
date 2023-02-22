import sqlite3 from 'sqlite3';

const dbPath = 'C:/Users/luca_/OneDrive/Desktop/bus_ml_api/data/database.db';

function openDatabase(){
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if(err){
            return console.error(err.message);
        }
    })
    return db;
}

export default openDatabase;