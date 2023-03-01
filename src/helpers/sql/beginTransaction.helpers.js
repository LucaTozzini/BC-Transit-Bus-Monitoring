function beginTransaction(db){
    return new Promise(resolve => {
        db.run('BEGIN TRANSACTION', (err) => {
            if(err){
                console.error(err.message);
            }
            resolve();
        })
    })
}

export default beginTransaction;