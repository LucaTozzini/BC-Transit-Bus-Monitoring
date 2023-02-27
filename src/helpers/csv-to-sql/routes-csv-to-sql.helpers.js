import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

function routesCsvToSql(routesTxt){
    return new Promise(resolve => {
        console.log('routesCsvToSql Start')
        const db = openDatabase();
        
        db.run(`CREATE TABLE routes(
            id INTEGER PRIMARY KEY,
            short_name INT,
            name TEXT
        )`, (err) => {
            if(err){
                console.error(err.message);
            }
            db.run(`DELETE FROM routes`, (err) => {
                if(err){
                    console.error(err.message);
                }
                
                csvtojson().fromFile(routesTxt).then(async json => {
                    json = json.map(({
                        route_id, 
                        route_short_name,
                        route_long_name
                    }) => ({
                        id: parseInt(route_id), 
                        short_name: parseInt(route_short_name),
                        name: route_long_name
                    }));

                    let i = 0;
                    for(const route of json){
                        i++;
                        console.log(i, '/', json.length);
                        await new Promise(resolve => {
                            const {id, short_name, name} = route;
                            db.run(`INSERT INTO routes (id, short_name, name) VALUES (?, ?, ?)`, [id, short_name, name], (err) => {
                                if(err){
                                    console.error(err.message);
                                }
                                resolve()
                            })
                        })
                    }
                    resolve();
                })
            })
        })                                                                   
    })
}

export default routesCsvToSql;