import downloadExtractZipFolder from "./downloadExtract-zipFolder.helpers.js";
import csvtojson from 'csvtojson';

import stopsCsvToSql from "./json-to-sql/stops-json-to-sql.helpers.js";
import stopTimesCsvToSql from "./json-to-sql/stopTimes-json-to-sql.helpers.js";
import tripsCsvToSql from "./json-to-sql/trips-json-to-sql.helpers.js";
import routesCsvToSql from "./json-to-sql/routes-json-to-sql.helpers.js";
import calendarCsvToSql from "./json-to-sql/calendar-json-to-sql.helpers.js";

import env from "../../env.js";

const gtfsUrls = {
    BC_Transit_Nanaimo: 'http://nanaimo.mapstrat.com/current/google_transit.zip',
    BC_Transit_Kelowna: 'http://kelowna.mapstrat.com/current/google_transit.zip',
    BC_Transit_Victoria: 'http://victoria.mapstrat.com/current/google_transit.zip',
    BC_Transit_Whistler: 'http://whistler.mapstrat.com/current/google_transit.zip',
    BC_Transit_Kamloops: 'http://kamloops.mapstrat.com/current/google_transit.zip',
    BC_Transit_Squamish: 'http://squamish.mapstrat.com/current/google_transit.zip',
    BC_Transit_Fort_St_John: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=28',
    BC_Transit_Port_Alberni: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=11',
    BC_Transit_Powell_River: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=29',
    BC_Transit_West_Kootenay: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=20',
    BC_Transit_Prince_George: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=22',
    BC_Transit_Prince_Rupert: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=23',
    BC_Transit_Campbell_River: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=12',
    BC_Transit_Sunshine_Coast: 'http://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=18',
};

let calendarJson = [], routesJson = [], stopTimesJson = [], stopsJson = [], tripsJson = [];

const gtfsPath = env.GTFS_DATA;

function downloadFolders(){
    return new Promise(async resolve => {
        console.log('Downloading Folders')
        let i = 0;
        for(const provider in gtfsUrls){
            i++;
            console.log(i, '/', Object.keys(gtfsUrls).length)
            const url = gtfsUrls[provider];
            const folder = await downloadExtractZipFolder(url, `${gtfsPath}/${provider}`);
        }
        resolve();
    })
}

function csvToJson(csv){
    return new Promise(resolve => {
        csvtojson().fromFile(csv).then(json => {
            resolve(json)
        })
    })
}

function buildCalendarJson(){
    return new Promise(async resolve => {
        for(const provider in gtfsUrls){
            let json = await csvToJson(`${gtfsPath}/${provider}/calendar.txt`);
            json = json.map(
                ({
                    service_id,
                    monday,
                    tuesday,
                    wednesday,
                    thursday,
                    friday,
                    saturday,
                    sunday,
                }) => ([
                    parseInt(service_id),
                    provider,
                    parseInt(monday),
                    parseInt(tuesday),
                    parseInt(wednesday),
                    parseInt(thursday),
                    parseInt(friday),
                    parseInt(saturday),
                    parseInt(sunday)
                ])
            );
            calendarJson.push(json);
        }
        calendarJson = calendarJson.reduce((acc, curr) => acc.concat(curr), []);
        resolve();
    })
}

function buildRoutesJson(){
    return new Promise(async resolve => {
        for(const provider in gtfsUrls){
            let json = await csvToJson(`${gtfsPath}/${provider}/routes.txt`);
            json = json.map(
                ({
                    route_id, 
                    route_short_name,
                    route_long_name,
                    route_color
                }) => ([
                    parseInt(route_id), 
                    provider,
                    parseInt(route_short_name),
                    route_long_name,
                    route_color
                ])
            );
            routesJson.push(json);
        }
        routesJson = routesJson.reduce((acc, curr) => acc.concat(curr), []);
        resolve();
    })
}

function buildStopsJson(){
    return new Promise(async resolve => {
        for(const provider in gtfsUrls){
            let json = await csvToJson(`${gtfsPath}/${provider}/stops.txt`);
            json = json.map(
                ({
                    stop_id, 
                    stop_code, 
                    stop_name, 
                    stop_lat, 
                    stop_lon
                }) => ([
                    parseInt(stop_id), 
                    provider,
                    parseInt(stop_code), 
                    stop_name, 
                    parseFloat(stop_lat), 
                    parseFloat(stop_lon)
                ])
            );
            stopsJson.push(json);
        }
        stopsJson = stopsJson.reduce((acc, curr) => acc.concat(curr), []);
        resolve();
    })
}

function buildStopTimesJson(){
    return new Promise(async resolve => {
        for(const provider in gtfsUrls){
            let json = await csvToJson(`${gtfsPath}/${provider}/stop_times.txt`);
            json = json.map(
                ({
                    trip_id,
                    arrival_time, 
                    departure_time,
                    stop_id,
                    stop_sequence
                }) => ([
                    provider,
                    parseInt(trip_id),
                    arrival_time,
                    departure_time,
                    parseInt(stop_id),
                    parseInt(stop_sequence)
                ])
            );
            stopTimesJson.push(json);
        }
        stopTimesJson = stopTimesJson.reduce((acc, curr) => acc.concat(curr), []);
        resolve();
    })
}

function buildTripsJson(){
    return new Promise(async resolve => {
        for(const provider in gtfsUrls){
            let json = await csvToJson(`${gtfsPath}/${provider}/trips.txt`);
            json = json.map(
                ({
                    trip_id,
                    service_id,
                    route_id, 
                    trip_headsign
                }) => ([
                    parseInt(trip_id),
                    provider,
                    parseInt(service_id),
                    parseInt(route_id), 
                    trip_headsign
                ])
            );
            tripsJson.push(json);
        }
        tripsJson = tripsJson.reduce((acc, curr) => acc.concat(curr), []);
        resolve();
    })
}

async function buildDatabase(){
    // Download Data
    await downloadFolders();
    
    // Parse Data
    console.log('Parsing Data');
    await buildCalendarJson();
    await buildRoutesJson();
    await buildStopsJson();
    await buildStopTimesJson();
    await buildTripsJson();

    console.log('routes-CsvToSql');
    await routesCsvToSql(routesJson);

    console.log('calendar-CsvToSql');
    await calendarCsvToSql(calendarJson);

    console.log('stops-CsvToSql');
    await stopsCsvToSql(stopsJson);

    console.log('trips-CsvToSql');
    await tripsCsvToSql(tripsJson);

    console.log('stopTimes-CsvToSql');
    await stopTimesCsvToSql(stopTimesJson);

    console.log('Set-up finished!')
}

buildDatabase()