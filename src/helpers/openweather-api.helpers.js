import getJsonFromApi from "./get-json-from-api.helpers.js";

const API_Key = '6dba72e05ea3a79891a554ea5cd4e93a';
const url = `https://api.openweathermap.org/data/2.5/weather?lat=48.4284&lon=-123.3656&appid=${API_Key}&units=metric`;

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

