import openDatabase from "../helpers/open-database.helpers.js";
const db = openDatabase();

function upcomingBuses(req, res, next){
    const stopId = parseInt(req.params.stopId);
    db.all(`SELECT * FROM gtf_trips WHERE stop_id = ${stopId}`, (err, rows) => {
        if(err){
            console.error(err.message);
            res.sendStatus(500);
        }
        res.locals.upcoming = rows;
        next()
    })
}

export default upcomingBuses;