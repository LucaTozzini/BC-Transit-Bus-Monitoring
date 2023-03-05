import db from '../helpers/database-pool.helpers.js';


function getStops(req, res, next){
    let WHERE = 'WHERE code IS NOT NULL'
    if(res.locals.mapBounds != undefined){
        var bounds = res.locals.mapBounds;
        var top = bounds._northEast.lat;
        var bottom = bounds._southWest.lat;
        var left = bounds._southWest.lng;
        var right = bounds._northEast.lng;
    
        WHERE += ` AND lat <= ${top} AND lat >= ${bottom} AND lng <= ${right} AND lng >= ${left}`
    }

    db.all(`SELECT * FROM stops ${WHERE}`, (err, rows) => {
        if(err){
            console.error(err.message);
            return res.sendStatus(500);
        }
        res.locals.stops = rows;
        next();
    })
}

export default getStops;