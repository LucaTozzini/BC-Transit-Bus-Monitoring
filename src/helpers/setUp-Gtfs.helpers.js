import downloadExtractZipFolder from "./downloadExtract-zipFolder.helpers.js";

import stopsCsvToSql from "./csv-to-sql/stops-csv-to-sql.helpers.js";
import stopTimesCsvToSql from "./csv-to-sql/stopTimes-csv-to-sql.helpers.js";
import tripsCsvToSql from "./csv-to-sql/trips-csv-to-sql.helpers.js";
import routesCsvToSql from "./csv-to-sql/routes-csv-to-sql.helpers.js";
import calendarCsvToSql from "./csv-to-sql/calendar-csv-to-sql.helpers.js";

const gtfsUrl = 'http://victoria.mapstrat.com/current/google_transit.zip';
const gtfsPath = 'C:/Users/luca_/github/BC-Transit-Bus-Monitoring/data/gtfs/';

async function setUpGtfs(){
    const folder = await downloadExtractZipFolder(gtfsUrl, gtfsPath);
    console.log('download', folder)

    await routesCsvToSql(gtfsPath+'/routes.txt');
    await calendarCsvToSql(gtfsPath+'/calendar.txt');
    await stopsCsvToSql(gtfsPath+'/stops.txt');
    await tripsCsvToSql(gtfsPath+'/trips.txt');
    await stopTimesCsvToSql(gtfsPath+'/stop_times.txt');

    console.log('Set-up finished!')
}

setUpGtfs()