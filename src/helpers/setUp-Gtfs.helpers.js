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

    console.log('routes-CsvToSql');
    await routesCsvToSql(gtfsPath+'/routes.txt');

    console.log('calendar-CsvToSql');
    await calendarCsvToSql(gtfsPath+'/calendar.txt');

    console.log('stops-CsvToSql');
    await stopsCsvToSql(gtfsPath+'/stops.txt');

    console.log('trips-CsvToSql');
    await tripsCsvToSql(gtfsPath+'/trips.txt');

    console.log('stopTimes-CsvToSql');
    await stopTimesCsvToSql(gtfsPath+'/stop_times.txt');

    console.log('Set-up finished!')
}

setUpGtfs()