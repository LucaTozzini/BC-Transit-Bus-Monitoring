import express from 'express';
import upcomingBuses from '../middleware/upcoming-buses.middleware.js';

const router = express.Router();

router.get('/stops', async (req, res) => {
    res.render('map', {type:'stops'});
});

router.get('/buses', (req, res) => {
    res.render('map', {type: 'buses'})
});

router.get('/upcoming/:stopId',
    upcomingBuses,
    (req, res) => {
        const upcoming = res.locals.upcoming;
        let html = ''
        for(const bus of upcoming){
            console.log(bus)
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
                    <div>${bus.short_name} - ${bus.name}</div>
                </div>
            `
        }

        if(html == ''){
            html = '<div class="bus-result">No Upcoming Buses</div>'
        }
        
        res.status(200).send(html)
    }
);

export default router;