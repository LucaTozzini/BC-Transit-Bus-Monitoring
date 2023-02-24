import openDatabase from "../helpers/open-database.helpers.js";

const db = openDatabase();

function getStop(req, res, next){
    db.get(`SELECT * FROM stops WHERE code = $code`, {$code: parseInt(req.params.stopCode)}, (err, row) => {
        if(err){
            console.error(err);
            return res.sendStatus(500);
        }
        res.locals.stop = row;
        next();
    })
}

export default getStop;