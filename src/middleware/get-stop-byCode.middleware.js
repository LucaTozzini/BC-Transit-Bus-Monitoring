import db from '../helpers/database-pool.helpers.js';

function getStopByCode(req, res, next){
    db.get(`SELECT * FROM stops WHERE code = $code AND provider = $provider`, {$code: parseInt(req.params.stopCode), $provider: req.params.provider}, (err, row) => {
        if(err){
            console.error(err);
            return res.sendStatus(500);
        }
        
        if(row == undefined){
            res.locals.validStopCode = false;
        }
        else{
            res.locals.validStopCode = true;
            res.locals.stop = row;
        }
        next();
    })
}

export default getStopByCode;