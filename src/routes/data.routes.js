import express from 'express';

import getStops from '../middleware/get-stops.middleware.js';
import getStopByCode from '../middleware/get-stop-byCode.middleware.js';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';
import upcomingStops from '../middleware/upcoming-stops.middleware.js';

import getTrips from '../middleware/get-trips.middleware.js';
import getPositions from '../middleware/get-positions.middleware.js';
import getPositionByVehicleId from '../middleware/get-position-byVehicleId.middleware.js';

import gtfsTrips from '../helpers/gtfs-trip.helpers.js';
import gtfsAlerts from '../helpers/gtfs-alerts.helpers.js'
import gtfsPosition from '../helpers/gtfs-position.helpers.js';

const router = express.Router()

router.get('/raw/trip-updates', async (req, res) => {
    const data = await gtfsTrips();
    res.json(data);
});

router.get('/raw/positions', async(req, res) => {
    const data = await gtfsPosition();
    res.json(data);
});

router.get('/raw/alerts', async (req, res) => {
    const data = await gtfsAlerts();
    res.json(data);
});

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

router.get('/position/:vehicleId',
    getPositionByVehicleId,
    (req, res) => {
        res.json(res.locals.position);
    }
)

router.get('/stops',
    getStops,
    (req, res) => {
        res.status(200).json(res.locals.stops)
    }
);

router.get('/stop/:stopCode/:provider',
    getStopByCode,
    (req, res) => {
        res.json(res.locals.stop);
    }
);

router.get('/upcoming/buses/:stopId',
    upcomingBuses,
    (req, res) => {
        res.status(200).json(res.locals.upcoming);
    }
);

router.get('/upcoming/stops/:tripId',
    upcomingStops,
    (req, res) => {
        res.json(res.locals.upcomingStops)
    }
)

export default router