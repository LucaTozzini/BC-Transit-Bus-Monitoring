import openDatabase from "../helpers/open-database.helpers.js";

const db = openDatabase()


function getBusPositions(req, res, next){
    if(res.locals.mapBounds != undefined){
        var bounds = res.locals.mapBounds;
        var top = bounds._northEast.lat;
        var bottom = bounds._southWest.lat;
        var left = bounds._southWest.lng;
        var right = bounds._northEast.lng;
    
        var WHERE = `WHERE lat <= ${top} AND lat >= ${bottom} AND lng <= ${right} AND lng >= ${left}`
    }
    else{
        var WHERE = ''
    }

    db.all(`SELECT * FROM gtf_positions ${WHERE}`, (err, rows) => {
        if(err){
            console.error(err.message);
            return res.sendStatus(500);
        }
        res.locals.busPositions = rows;
        next();
    })
}

export default getBusPositions;