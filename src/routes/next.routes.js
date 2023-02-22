import express from 'express';
import nextScheduledBus from '../helpers/next-scheduled-bus.helpers.js'
import currentWeather from '../middleware/current-weather.middleware.js'

const router = express.Router()

router.get('/', 
    currentWeather,
    (req, res) => {
        try{
            const next_scheduled = nextScheduledBus();
            res.status(200).json({next_scheduled, weather: res.locals.weather});
        }
        catch(err){
            console.error(err.message);
            res.sendStatus(500)
        }
    }
)

export default router;