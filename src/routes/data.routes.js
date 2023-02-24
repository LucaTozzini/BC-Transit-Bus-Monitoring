import express from 'express';

import getMapBounds from '../middleware/get-mapBounds.middleware.js'
import getStops from '../middleware/get-stops.middleware.js';
import getStopByCode from '../middleware/get-stop-byCode.middleware.js';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';
import getPositions from '../middleware/get-positions.middleware.js';
import getTrips from '../middleware/get-trips.middleware.js';

const router = express.Router()

router.get('/trip-updates', 
    getTrips,
    (req, res) => {
        res.status(200).json(res.locals.trips);
    }
);

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

router.get('/stop/:stopCode',
    getStopByCode,
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