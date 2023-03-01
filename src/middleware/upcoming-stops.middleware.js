import openDatabase from "../helpers/open-database.helpers.js";
const db = openDatabase();

function upcomingStops(req, res, next){
    const vehicleId = parseInt(req.params.vehicleId);

    db.all(
        `SELECT st.*, r.short_name, s.name
        FROM gtf_positions AS p
        JOIN stop_times AS st ON st.trip_id = p.trip_id AND st.stop_sequence >= p.stop_sequence
        JOIN stops AS s ON s.id = st.stop_id
        JOIN trips AS t ON t.id = p.trip_id
        JOIN routes AS r ON r.id = t.route_id  
        WHERE p.vehicle_id = ${vehicleId}`,
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