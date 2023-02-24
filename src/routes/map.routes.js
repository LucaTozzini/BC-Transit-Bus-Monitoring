import express from 'express';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('map');
});

router.get('/upcoming/:stopId',
    upcomingBuses,
    (req, res) => {
        const upcoming = res.locals.upcoming;
        let html = ''
        for(const bus of upcoming){
            html += `
                <div class="bus-result">${new Date(bus.arrival_time * 1000)}</div>
            `
        }

        if(html == ''){
            html = '<div class="bus-result">No Upcoming Buses</div>'
        }
        
        res.status(200).send(html)
    }
);

export default router;