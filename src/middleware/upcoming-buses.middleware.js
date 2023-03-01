import openDatabase from "../helpers/open-database.helpers.js";
const db = openDatabase();

function upcomingBuses(req, res, next){
    const stopId = parseInt(req.params.stopId);
    // create a new Date object
    let now = new Date();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // get the current hour, minute and second
    let hours = now.getHours() < 3 ? now.getHours() + 24 : now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    const day = weekdays[now.getHours() < 3 ? now.getDay() - 1 : now.getDay()];

    // add leading zeros to the hours, minutes and seconds if necessary
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');

    // combine the values into a formatted string
    let time = `${hours}:${minutes}:${seconds}`;

    db.all(`
        SELECT st.*, g.arrival_time, t.headsign, r.short_name, r.name, st.scheduled_time, c.*
        FROM stop_times AS st
        LEFT JOIN gtf_trips AS g ON st.trip_id = g.trip_id AND st.stop_id = g.stop_id
        JOIN trips AS t ON st.trip_id = t.id
        JOIN routes AS r ON t.route_id = r.id
        JOIN calendar AS c ON t.service_id = c.service_id
        WHERE st.stop_id = ${stopId} AND st.scheduled_time > "${time}" AND ${day} = 1
        ORDER BY st.scheduled_time ASC`, 
        (err, rows) => {
            if(err){
                console.error(err.message);
                res.sendStatus(500);
            }

            res.locals.upcoming = rows;
            next()
        }
    )
}

export default upcomingBuses;