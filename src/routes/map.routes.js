import express from 'express';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';
import upcomingStops from '../middleware/upcoming-stops.middleware.js';
import getStopByCode from '../middleware/get-stop-byCode.middleware.js';

import db from '../helpers/database-pool.helpers.js';

import getMapBounds from '../middleware/get-mapBounds.middleware.js'
import getStops from '../middleware/get-stops.middleware.js';
import getBusPositions from '../middleware/get-busPositions.middleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const userAgent = req.useragent;
    const type = parseInt(req.query.type);
    res.render('map', {type, userAgent});
});

router.get('/upcoming/buses/:stopCode/:provider',
    upcomingBuses,
    getStopByCode,
    (req, res) => {
        const upcoming = res.locals.upcoming;

        let partialInfo = {
            header: {
                title: res.locals.validStopCode ? res.locals.stop.name : 'No Stop Found',
                code: res.locals.stop.code
            },
            upcoming: []
        };

        for(const bus of upcoming){
            let schHour = parseInt(bus.departure_time.split(':')[0]);
            if(schHour > 23){
                schHour = schHour - 24
            }
            const schMinute = parseInt(bus.departure_time.split(':')[1]);

            let arrivalTimeText = `${schHour.toString().padStart(2, '0')}:${schMinute.toString().padStart(2, '0')}`;
            let punctualityText = 'Scheduled';
            let punctualityClass = '';
            const titleText = bus.headsign;

            if(bus.updated_time != null){
                const rtDate = new Date(bus.updated_time * 1000);
                const rtHour = rtDate.getHours();
                const rtMinute = rtDate.getMinutes();
                const punct = ((schHour * 60) + schMinute) - ((rtHour * 60) + rtMinute);

                if(punct == 0){
                    arrivalTimeText = `${schHour.toString().padStart(2, '0')}:${schMinute.toString().padStart(2, '0')}`;
                    punctualityText = 'On Time';
                    punctualityClass = 'onTime';
                }
                else if(punct < 0){
                    arrivalTimeText = `${rtHour.toString().padStart(2, '0')}:${rtMinute.toString().padStart(2, '0')}`;
                    punctualityText = `${Math.abs(punct)} Minutes Late`;
                    punctualityClass = 'Late';

                }
                else if(punct > 0){
                    arrivalTimeText = `${rtHour.toString().padStart(2, '0')}:${rtMinute.toString().padStart(2, '0')}`;
                    punctualityText = `${Math.abs(punct)} Minutes Early`;
                    punctualityClass = 'Early';
                }
            }

            partialInfo.upcoming.push({
                titleText,
                arrivalTimeText,
                punctualityClass,
                punctualityText
            })
        }
        
        res.render('partials/map-results', {header: partialInfo.header, upcoming: partialInfo.upcoming, upcomingType: 'Buses'});
    }
);

router.get('/upcoming/stops/:vehicleId/:provider',
    upcomingStops,
    (req, res) => {
        const upcoming = res.locals.upcomingStops;

        let partialInfo = {
            header: {
                title: upcoming.length > 0 ? upcoming[0].headsign : 'Not In Service',
                code: upcoming[0].vehicle_id
            },
            upcoming: []
        };

        for(const stop of upcoming){
            partialInfo.upcoming.push({
                titleText: stop.name,
                arrivalTimeText: `${stop.departure_time.split(':')[0]}:${stop.departure_time.split(':')[1]}`,
                punctualityClass: '',
                punctualityText: 'Scheduled'
            })
        }

        res.render('partials/map-results', {header: partialInfo.header, upcoming: partialInfo.upcoming, upcomingType: 'Stops'});
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
);

router.get('/points/route/:tripId/:provider', (req, res) => {
    db.all(`
        SELECT sh.*, tr.headsign
        FROM shapes AS sh
        JOIN (
            SELECT *
            FROM trips
            WHERE id = ? AND provider = ?
            LIMIT 1
        ) AS tr ON tr.shape_id = sh.id AND tr.provider = sh.provider
        ORDER BY shape_pt_sequence ASC
    `, [req.params.tripId, req.params.provider], (err, rows) => {
        if(err){
            console.error(err)
            res.send(err.message);
        }
        else{
            res.json(rows);
        }
    })
})

export default router;