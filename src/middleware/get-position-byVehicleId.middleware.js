import db from '../helpers/database-pool.helpers.js';

function getPositionByVehicleId(req, res, next){
    const vehicleId = parseInt(req.params.vehicleId)
    db.get(`SELECT * FROM gtf_positions WHERE vehicle_id = ${vehicleId}`, (err, row) => {
        if(err){
            console.error(err.message);
            res.sendStatus(500);
        }
        res.locals.position = row;
        next();
    })
}

export default getPositionByVehicleId;