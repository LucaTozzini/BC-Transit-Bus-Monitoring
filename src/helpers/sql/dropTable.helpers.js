function dropTable(db, table){
    return new Promise(resolve => {
        db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
            if(err){
                console.error(err.message);
            }
            resolve();
        })
    })
}

export default dropTable;