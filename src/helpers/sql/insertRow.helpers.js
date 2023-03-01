function insertRow(prep, data){
    return new Promise(resolve => {
        prep.run(data, (err) => {
            if(err){
                console.error(err.message)
                resolve(new Error());
            }
            else{
                resolve();
            }
        })
    })
}

export default insertRow;