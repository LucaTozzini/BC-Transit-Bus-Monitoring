import express from 'express';
import db from '../helpers/database-pool.helpers.js'

const router = express.Router();

router.get('/trainingData', (req, res) => {
    db.all(`
        SELECT 
            po.lat, 
            po.lng, 
            po.status, 
            po.trip_id, 
            trips.route_id,
            po.provider, 
            po.occupancy,
            tr.arrival_time AS expected_arrival,
            ti.arrival_time AS scheduled_arrival
            
        FROM gtf_positions AS po
        JOIN gtf_trips AS tr ON tr.trip_id = po.trip_id AND tr.stop_id = po.stop_id AND tr.provider = po.provider
        JOIN stop_times AS ti ON ti.trip_id = po.trip_id AND ti.provider = po.provider AND ti.stop_id = po.stop_id
        JOIN trips ON trips.id = tr.trip_id
    `, (err, rows) => {
        if(err){
            console.error(err.message);
            res.sendStatus(500);
        }
        else{
            res.json(rows);
        }
    })
});

export default router;