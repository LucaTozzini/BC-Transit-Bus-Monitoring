import express from 'express';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';
import upcomingStops from '../middleware/upcoming-stops.middleware.js';
import getStop from '../middleware/get-stop-byCode.middleware.js';

import getMapBounds from '../middleware/get-mapBounds.middleware.js'
import getStops from '../middleware/get-stops.middleware.js';
import getBusPositions from '../middleware/get-busPositions.middleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const userAgent = req.useragent;
    const type = parseInt(req.query.type);
    res.render('map', {type, userAgent});
});

router.get('/upcoming/buses/:stopCode',
    upcomingBuses,
    getStop,
    (req, res) => {
        const upcoming = res.locals.upcoming;

        let html = ''
        for(const bus of upcoming){
            // .toString().padStart(2, '0')
            let schHour = parseInt(bus.departure_time.split(':')[0]);
            if(schHour > 23){
                schHour = schHour - 24
            }
            const schMinute = parseInt(bus.departure_time.split(':')[1]);

            let timeHtml = `
                <div class="result-time">
                    <div class="result-time-arrival">${schHour.toString().padStart(2, '0')}:${schMinute.toString().padStart(2, '0')}</div>
                    <div class="result-time-punctuality">Scheduled</div> 
                </div>
            `;

            if(bus.updated_time != null){
                const rtDate = new Date(bus.updated_time * 1000);
                const rtHour = rtDate.getHours();
                const rtMinute = rtDate.getMinutes();

                let punctuality = ((schHour * 60) + schMinute) - ((rtHour * 60) + rtMinute);

                if(punctuality == 0){
                    timeHtml = `
                        <div class="result-time">
                            <div class="result-time-arrival">${schHour.toString().padStart(2, '0')}:${schMinute.toString().padStart(2, '0')}</div>
                            <div class="result-time-punctuality onTime">On Time</div> 
                        </div>
                    `;    
                }
                else if(punctuality < 0){
                    timeHtml = `
                        <div class="result-time">
                            <div class="result-time-arrival">${rtHour.toString().padStart(2, '0')}:${rtMinute.toString().padStart(2, '0')}</div>
                            <div class="result-time-punctuality Late">${Math.abs(punctuality)} Minutes Late</div> 
                        </div>
                    `;
                }
                else if(punctuality > 0){
                    timeHtml = `
                        <div class="result-time">
                            <div class="result-time-arrival">${rtHour.toString().padStart(2, '0')}:${rtMinute.toString().padStart(2, '0')}</div>
                            <div class="result-time-punctuality Early">${Math.abs(punctuality)} Minutes Early</div> 
                        </div>
                    `;
                }


            }
            
            html += `
                <div class="bus-result">
                    ${timeHtml}
                    <div>${bus.headsign}</div>
                </div>
            `
        }

        if(html == ''){
            html = '<div class="bus-result">No Upcoming Buses</div>'
        }

        const fullHtml = `
            <div id="result-header">
                <div id="result-title"> ${res.locals.validStopCode ? `${res.locals.stop.name} <span id="title-code"> (${res.locals.stop.code}) </span>` : 'No Stop Found'} </div>
                <button id="clear-button" onclick="panelSet.clear()"></div>
            </div>
            <div id="bus-results">
                ${html}
            </div>
        `
        
        res.status(200).send(fullHtml)
    }
);

router.get('/upcoming/stops/:vehicleId',
    upcomingStops,
    (req, res) => {
        const upcoming = res.locals.upcomingStops;
        let html = '';
        for(const stop of upcoming){
            html += `
                <div class="bus-result">
                    <div>${stop.departure_time}</div>
                    <div>${stop.name}</div>
                </div>
            `
        }

        if(html == ''){
            html = '<div class="bus-result">No Upcoming Stops</div>'
        }

        const fullHtml = `
            <div id="result-header">
                <div id="result-title"> ${upcoming.length > 0 ? `${upcoming[0].headsign} <span id="title-code"> (${upcoming[0].vehicle_id}) </span>` : 'No Stop Found'} </div>
                <button id="clear-button" onclick="panelSet.clear()"></div>
            </div>
            <div id="bus-results">
                ${html}
            </div>
        `

        res.status(200).send(fullHtml)
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