import openWeather from "../helpers/openweather-api.helpers.js";

async function currentWeather(req, res, next){
    try{
        const weatherData = {
            main: await openWeather.main(),
            description: await openWeather.description(),
            temp: await openWeather.temp(),
            visibility: await openWeather.visibility()
        }

        res.locals.weather = weatherData
        next()
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
} 

export default currentWeather