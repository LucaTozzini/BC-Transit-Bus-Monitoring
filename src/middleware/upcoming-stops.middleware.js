import openDatabase from "../helpers/open-database.helpers.js";
const db = openDatabase();

function upcomingStops(req, res, next){
    const tripId = parseInt(req.params.tripId);
    const stopSeq = parseInt(req.params.stopSeq);

    db.all(
        `SELECT s.*
        FROM gtf_positions AS p
        JOIN stop_times AS s ON s.trip_id = p.trip_id
        WHERE p.trip_id = ${tripId} AND p.stop_sequence >= ${stopSeq}`,
        (err, rows) => {
            if(err){
                console.error(err.message);
                return res.sendStatus(500);
            }
            res.locals.upcomingStops = rows;
            next();
        }
    )
}

export default upcomingStops;