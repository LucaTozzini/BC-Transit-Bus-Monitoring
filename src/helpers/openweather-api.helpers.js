import getJsonFromApi from "./get-json-from-api.helpers.js";

import dotenv from 'dotenv';
dotenv.config({path:'C:/Users/luca_/github/BC-Transit-Bus-Monitoring/.env'});

const url = `https://api.openweathermap.org/data/2.5/weather?lat=48.4284&lon=-123.3656&appid=${process.env.OPENWEATHER_KEY}&units=metric`;

const openWeather = {
    all: () => {
        return new Promise(async resolve => {
            const data = await getJsonFromApi(url)
            resolve(data);
        })
    },
    main: () => {
        return new Promise(async resolve =>{
            const data = (await getJsonFromApi(url)).weather[0].main;
            resolve(data);
        })
    },
    description: () => {
        return new Promise(async resolve =>{
            const data = (await getJsonFromApi(url)).weather[0].description;
            resolve(data);
        })
    },
    temp: () => {
        return new Promise(async resolve =>{
            const data = (await getJsonFromApi(url)).main.temp;
            resolve(data);
        })
    },
    visibility: () => {
        return new Promise(async resolve =>{
            const data = (await getJsonFromApi(url)).visibility;
            resolve(data);
        })
    }
}

export default openWeather;

