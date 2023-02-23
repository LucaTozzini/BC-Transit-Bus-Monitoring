import express from 'express';
import gtfTrip from '../helpers/gtf-trip.helpers.js'

import getMapBounds from '../middleware/get-mapBounds.middleware.js'
import getStops from '../middleware/get-stops.middleware.js';
import getStop from '../middleware/get-stop.middleware.js';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';
import getPositions from '../middleware/get-positions.middleware.js';

const router = express.Router()

router.get('/trip-updates', async (req, res) => {
    try{
        const data = await gtfTrip();
        if(data == 500){
            throw new Error();
        }
        res.json(data);
    }
    catch{
        res.status(200).send('Oops... There seems to be a problem with the data at the moment :(')
    }
});

router.get('/positions', 
    getPositions,
    (req, res) => {
        res.status(200).json(res.locals.positions)
    }
);

router.get('/stops',
    getStops,
    (req, res) => {
        res.status(200).json(res.locals.stops)
    }
);

router.get('/stop',
    getStop,
    (req, res) => {
        res.json(res.locals.stop);
    }
);

router.post('/points', 
    getMapBounds,
    getStops,
    (req, res) => {
        res.status(200).json(res.locals.stops)
    }
);

router.get('/upcoming/:stopId',
    upcomingBuses,
    (req, res) => {
        res.status(200).json(res.locals.upcoming);
    }
);
export default router