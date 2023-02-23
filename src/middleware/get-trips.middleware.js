import openDatabase from "../helpers/open-database.helpers.js";
const db = openDatabase()

function getTrips(req, res, next){
    db.all('SELECT * FROM gtf_trips', (err, rows) => {
        if(err){
            console.error(err.message);
            res.sendStatus(500);
        }
        res.locals.trips = rows;
        next();
    })
}

export default getTrips;