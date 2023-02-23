import openDatabase from "../helpers/open-database.helpers.js";
const db = openDatabase()

function getPositions(req, res, next){
    db.all('SELECT * FROM gtf_positions', (err, rows) => {
        if(err){
            console.error(err.message);
            res.sendStatus(500);
        }
        res.locals.positions = rows;
        next();
    })
}

export default getPositions;