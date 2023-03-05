import db from '../helpers/database-pool.helpers.js';

function getTrips(req, res, next){
    db.all('SELECT t.*, st.scheduled_time FROM gtf_trips AS t JOIN stop_times AS st ON t.trip_id = st.trip_id AND t.stop_sequence = st.stop_sequence', (err, rows) => {
        if(err){
            console.error(err.message);
            res.sendStatus(500);
        }
        res.locals.trips = rows;
        next();
    })
}

export default getTrips;