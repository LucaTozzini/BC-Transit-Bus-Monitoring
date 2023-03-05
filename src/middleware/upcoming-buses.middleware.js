import db from '../helpers/database-pool.helpers.js';

function upcomingBuses(req, res, next){
    const stopCode = parseInt(req.params.stopCode);
    const provider = req.params.provider;

    // create a new Date object
    let now = new Date();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // get the current hour, minute and second
    let hours = now.getHours() < 3 ? now.getHours() + 24 : now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    const today = weekdays[now.getDay()];
    const yesterday = weekdays[now.getDay() - 1];

    // add leading zeros to the hours, minutes and seconds if necessary
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');

    // combine the values into a formatted string
    let time = `${hours}:${minutes - 1}:00`;

    db.all(`
        SELECT st.*, g.arrival_time AS updated_time, t.headsign, r.short_name, r.name, st.departure_time, c.*, s.code, s.name
        FROM stop_times AS st 
        LEFT JOIN gtf_trips AS g ON st.trip_id = g.trip_id AND st.stop_id = g.stop_id AND st.provider = g.provider
        JOIN stops AS s ON s.id = st.stop_id AND s.provider = st.provider
        JOIN trips AS t ON st.trip_id = t.id AND t.provider = t.provider
        JOIN routes AS r ON t.route_id = r.id AND t.provider = r.provider
        JOIN calendar AS c ON t.service_id = c.service_id AND t.provider = c.provider
        WHERE 
            s.code = ${stopCode} 
            AND s.provider = "${provider}" 
            AND(
                st.departure_time >= "${time}" 
                OR 
                g.arrival_time >= "${time}"
            ) 
            AND(
                (st.departure_time < "24:00:00" AND ${today} = 1) 
                OR 
                (st.departure_time >= "24:00:00" AND ${yesterday} = 1)
            )
        ORDER BY st.departure_time ASC`,
        (err, rows) => {
            if(err){
                console.error(err.message);
                return res.sendStatus(500);
            }
            res.locals.upcoming = rows;
            next()
        }
    )
}

export default upcomingBuses;