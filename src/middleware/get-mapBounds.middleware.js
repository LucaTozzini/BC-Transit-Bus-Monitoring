function getMapBounds(req, res, next){
    if(!req.body.hasOwnProperty('mapBounds')){
        return res.sendStatus(500);
    }
    res.locals.mapBounds = req.body.mapBounds;
    next();
}

export default getMapBounds;