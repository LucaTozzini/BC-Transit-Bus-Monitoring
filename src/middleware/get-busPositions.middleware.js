import db from '../helpers/database-pool.helpers.js';

function getBusPositions(req, res, next){
    if(res.locals.mapBounds == undefined){
        console.error('getBusPositions Error: Bounds Undefined')
        res.sendStatus(400);
    }

    var bounds = res.locals.mapBounds;
    var top = bounds._northEast.lat;
    var bottom = bounds._southWest.lat;
    var left = bounds._southWest.lng;
    var right = bounds._northEast.lng;

    db.all(`
        SELECT po.*, tr.headsign 
        FROM gtf_positions AS po
        JOIN trips AS tr ON tr.id = po.trip_id
        WHERE lat <= ? AND lat >= ? AND lng <= ? AND lng >= ?
        `, [top, bottom, right, left], (err, rows) => {
        if(err){
            console.error(err.message);
            return res.sendStatus(500);
        }
        res.locals.busPositions = rows;
        next();
    })
}

export default getBusPositions;