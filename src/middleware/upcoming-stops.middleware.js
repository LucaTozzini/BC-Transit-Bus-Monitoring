import db from '../helpers/database-pool.helpers.js';

function upcomingStops(req, res, next){
    const vehicleId = parseInt(req.params.vehicleId);
    const provider = req.params.provider;

    db.all(
        `SELECT st.*, r.short_name, s.name, t.headsign, p.vehicle_id
        FROM gtf_positions AS p
        JOIN stop_times AS st ON st.trip_id = p.trip_id AND st.stop_sequence >= p.stop_sequence AND st.provider = p.provider
        JOIN stops AS s ON s.id = st.stop_id AND s.provider = st.provider
        JOIN trips AS t ON t.id = p.trip_id AND t.provider = p.provider
        JOIN routes AS r ON r.id = t.route_id AND r.provider = t.provider
        WHERE p.vehicle_id = ${vehicleId} AND p.provider = "${provider}"`,
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