function renameTable(db, table, newName){
    return new Promise(resolve => {
        db.run(`ALTER TABLE ${table} RENAME TO ${newName}`, (err) => {
            if(err){
                console.error(err.message);
            }
            resolve()
        });
    })
}

export default renameTable;