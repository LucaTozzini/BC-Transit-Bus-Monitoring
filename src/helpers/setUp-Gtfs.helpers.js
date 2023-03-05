import downloadExtractZipFolder from "./downloadExtract-zipFolder.helpers.js";
import csvtojson from 'csvtojson';

import stopsCsvToSql from "./json-to-sql/stops-json-to-sql.helpers.js";
import stopTimesCsvToSql from "./json-to-sql/stopTimes-json-to-sql.helpers.js";
import tripsCsvToSql from "./json-to-sql/trips-json-to-sql.helpers.js";
import routesCsvToSql from "./json-to-sql/routes-json-to-sql.helpers.js";
import calendarCsvToSql from "./json-to-sql/calendar-json-to-sql.helpers.js";
import shapesCsvToSql from "./json-to-sql/shapes-json-to-sql.helpers.js";

import env from "../../env.js";

const gtfsUrls = {
    // BC Transit
    BC_Transit_Nanaimo: 'https://nanaimo.mapstrat.com/current/google_transit.zip',
    BC_Transit_Kelowna: 'https://kelowna.mapstrat.com/current/google_transit.zip',
    BC_Transit_Victoria: 'https://victoria.mapstrat.com/current/google_transit.zip',
    BC_Transit_Whistler: 'https://whistler.mapstrat.com/current/google_transit.zip',
    BC_Transit_Kamloops: 'https://kamloops.mapstrat.com/current/google_transit.zip',
    BC_Transit_Squamish: 'https://squamish.mapstrat.com/current/google_transit.zip',
    BC_Transit_Fort_St_John: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=28',
    BC_Transit_Port_Alberni: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=11',
    BC_Transit_Powell_River: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=29',
    BC_Transit_West_Kootenay: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=20',
    BC_Transit_Prince_George: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=22',
    BC_Transit_Prince_Rupert: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=23',
    BC_Transit_Campbell_River: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=12',
    BC_Transit_Sunshine_Coast: 'https://bct.tmix.se/Tmix.Cap.TdExport.WebApi/gtfs/?operatorIds=18',

    // Translink
    Translink: 'https://gtfs-static.translink.ca/gtfs/google_transit.zip?_gl=1*1c1364t*_ga*MTQxMDQ4NjU4Ni4xNjc2NzA0NjQz*_ga_2559ZWBT54*MTY3Nzg4NTg0Ny42LjAuMTY3Nzg4NTg1MC41Ny4wLjA.',

    // Metrolinx
    Metrolinx: 'https://www.gotransit.com/static_files/gotransit/assets/Files/GO_GTFS.zip?v=1677983367811',
};

let calendarJson = [], routesJson = [], stopTimesJson = [], stopsJson = [], tripsJson = [], shapesJson = [];

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
        }).catch(err => {
            console.error(err.message);
            resolve([]);
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
                    `${arrival_time.split(':')[0].padStart(2, '0')}:${arrival_time.split(':')[1].padStart(2, '0')}:${arrival_time.split(':')[2].padStart(2, '0')}`,
                    `${departure_time.split(':')[0].padStart(2, '0')}:${departure_time.split(':')[1].padStart(2, '0')}:${departure_time.split(':')[2].padStart(2, '0')}`,
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

function buildShapesJson(){
    return new Promise(async resolve => {
        for(const provider in gtfsUrls){
            let json = await csvToJson(`${gtfsPath}/${provider}/shapes.txt`);
            json = json.map(
                ({
                    shape_id,
                    shape_pt_lat,
                    shape_pt_lon,
                    shape_pt_sequence
                }) => ([
                    parseInt(shape_id),
                    provider,
                    parseFloat(shape_pt_lat),
                    parseFloat(shape_pt_lon),
                    parseInt(shape_pt_sequence)
                ])
            );
            shapesJson.push(json);
        }
        shapesJson = shapesJson.reduce((acc, curr) => acc.concat(curr), []);
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
                    trip_headsign,
                    shape_id,
                }) => ([
                    parseInt(trip_id),
                    provider,
                    parseInt(service_id),
                    parseInt(route_id), 
                    trip_headsign,
                    parseInt(shape_id),
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
    console.log('Parsing Calendars');
    await buildCalendarJson();

    console.log('Parsing Routes');
    await buildRoutesJson();

    console.log('Parsing Stops');
    await buildStopsJson();

    console.log('Parsing Stop Times');
    await buildStopTimesJson();

    console.log('Parsing Trips');
    await buildTripsJson();

    console.log('Parsing Shapes');
    await buildShapesJson();

    // Write To Database
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

    console.log('shapes-CsvToSql')
    await shapesCsvToSql(shapesJson);

    console.log('Set-up finished!')
}

buildDatabase()