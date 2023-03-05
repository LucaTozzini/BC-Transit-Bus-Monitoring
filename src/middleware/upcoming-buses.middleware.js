import db from '../helpers/database-pool.helpers.js';

function upcomingBuses(req, res, next){
    const stopCode = parseInt(req.params.stopCode);
    const provider = req.params.provider;

    // create a new Date object
    let now = new Date();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // get the current hour, minute and second
    const rawHours = now.getHours();
    const rawMinutes = now.getMinutes();

    const today = weekdays[now.getDay()];
    const yesterday = weekdays[(now.getDay() - 1 + 7) % 7];

    // add leading zeros to the hours, minutes and seconds if necessary
    const hours = rawHours.toString().padStart(2, '0');
    const yHours = (rawHours + 24).toString();
    const minutes = (rawMinutes - 1).toString().padStart(2, '0');

    // combine the values into a formatted string
    const time = `${hours}:${minutes}:00`;
    const yTime = `${yHours}:${minutes}:00`;

    db.all(`
        SELECT st.*, g.arrival_time AS updated_time, t.headsign, r.short_name, r.name, st.departure_time, c.*, s.code, s.name,
            CASE 
                WHEN st.departure_time >= '24:00:00' AND ${yesterday} = 1 THEN 1
                ELSE 2
            END AS is_yesterday
        FROM stop_times AS st 
        LEFT JOIN gtf_trips AS g ON st.trip_id = g.trip_id AND st.stop_id = g.stop_id AND st.provider = g.provider
        JOIN stops AS s ON s.id = st.stop_id AND s.provider = st.provider
        JOIN trips AS t ON st.trip_id = t.id AND t.provider = t.provider
        JOIN routes AS r ON t.route_id = r.id AND t.provider = r.provider
        JOIN calendar AS c ON t.service_id = c.service_id AND t.provider = c.provider
        WHERE 
            s.code = $code
            AND s.provider = $provider
            AND(
                (${today} = 1 AND (st.departure_time >= $time OR g.arrival_time >= $time)) 
                OR 
                (st.departure_time >= "24:00:00" AND ${yesterday} = 1 AND (st.departure_time >= $yTime OR g.arrival_time >= $yTime))
            )
        ORDER BY is_yesterday ASC, st.departure_time ASC
        
        `,
        {$code: stopCode, $provider: provider, $time: time, $yTime: yTime},
        (err, rows) => {
            if(err){
                console.error(123, err.message);
                return res.sendStatus(500);
            }
            res.locals.upcoming = rows;
            next()
        }
    )
}

export default upcomingBuses;