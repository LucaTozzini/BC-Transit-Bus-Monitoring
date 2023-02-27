import csvtojson from 'csvtojson';
import openDatabase from '../open-database.helpers.js';

function calendarCsvToSql(calendarTxt){
    return new Promise(resolve => {
        console.log('calendarCsvToSql Start')
        const db = openDatabase();
        
        db.run(`CREATE TABLE calendar(
            service_id INTEGER PRIMARY KEY,
            monday INT,
            tuesday INT,
            wednesday INT,
            thursday INT,
            friday INT,
            saturday INT,
            sunday INT
        )`, (err) => {
            if(err){
                console.error(err.message);
            }
            db.run(`DELETE FROM calendar`, (err) => {
                if(err){
                    console.error(err.message);
                }
                
                csvtojson().fromFile(calendarTxt).then(async json => {
                    json = json.map(({
                        service_id,
                        monday,
                        tuesday,
                        wednesday,
                        thursday,
                        friday,
                        saturday,
                        sunday
                    }) => ({
                        service_id: parseInt(service_id),
                        monday: parseInt(monday),
                        tuesday: parseInt(tuesday),
                        wednesday: parseInt(wednesday),
                        thursday: parseInt(thursday),
                        friday: parseInt(friday),
                        saturday: parseInt(saturday),
                        sunday: parseInt(sunday)
                    }));
                    let i = 0
                    for(const service of json){
                        i++
                        console.log(i, '/', json.length)
                        await new Promise(resolve => {
                            const {service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday} = service;
                            db.run(`
                                INSERT INTO calendar (
                                    service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                                [service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday], 
                                (err) => {
                                if(err){
                                    console.error(err.message);
                                }
                                resolve()
                            })
                        })
                    }
                    resolve()
                })
            })
        })                                                                   

    })
}

export default calendarCsvToSql;