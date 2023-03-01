import express from 'express';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';
import upcomingStops from '../middleware/upcoming-stops.middleware.js';

import getMapBounds from '../middleware/get-mapBounds.middleware.js'
import getStops from '../middleware/get-stops.middleware.js';
import getBusPositions from '../middleware/get-busPositions.middleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const type = parseInt(req.query.type);
    res.render('map', {type});
});

router.get('/upcoming/buses/:stopId',
    upcomingBuses,
    (req, res) => {
        const upcoming = res.locals.upcoming;
        let html = ''
        for(const bus of upcoming){
            const date = new Date(bus.arrival_time * 1000);
            let hour;
            let minute;

            if(bus.arrival_time == null){
                hour = bus.scheduled_time.split(':')[0];
                minute = bus.scheduled_time.split(':')[1];
            }
            else{
                hour = date.getHours().toString().padStart(2, '0');
                minute = date.getMinutes().toString().padStart(2, '0');
            }
            html += `
                <div class="bus-result">
                    <div>${hour}:${minute}</div>
                    <div>${bus.headsign}</div>
                </div>
            `
        }

        if(html == ''){
            html = '<div class="bus-result">No Upcoming Buses</div>'
        }
        
        res.status(200).send(html)
    }
);

router.get('/upcoming/stops/:vehicleId',
    upcomingStops,
    (req, res) => {
        const upcoming = res.locals.upcomingStops;
        let html = '';
        for(const bus of upcoming){
            html += `
                <div class="bus-result">
                    <div>${bus.scheduled_time}</div>
                    <div>${bus.short_name} - ${bus.name}</div>
                </div>
            `
        }

        if(html == ''){
            html = '<div class="bus-result">No Upcoming Stops</div>'
        }

        res.status(200).send(html)
    }
)

router.post('/points/stops', 
    getMapBounds,
    getStops,
    (req, res) => {
        res.status(200).json(res.locals.stops)
    }
);

router.post('/points/buses', 
    getMapBounds,
    getBusPositions,
    (req, res) => {
        res.status(200).json(res.locals.busPositions);
    }
)

export default router;