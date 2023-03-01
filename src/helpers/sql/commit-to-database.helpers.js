function commitToDatabase(db){
    return new Promise(resolve => {
        db.run('COMMIT', (err) => {
            if(err){
                console.error(err.message);
            }
            resolve();
        })
    })
}

export default commitToDatabase;