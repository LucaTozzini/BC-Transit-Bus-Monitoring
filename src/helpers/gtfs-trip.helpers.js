import downloadFile from './download-file.helpres.js';
import gtfs from 'gtfs-realtime-bindings';
import fs from 'fs'

const fileUrl = 'https://victoria.mapstrat.com/current/gtfrealtime_TripUpdates.bin';
const filePath = 'C:/Users/luca_/OneDrive/Desktop/bus_ml_api/data/gtfrealtime_TripUpdates.bin';

function gtfsTrip(){
    return new Promise(async resolve => {
        try{
            // await downloadFile(fileUrl, filePath);
            const buffer = fs.readFileSync(filePath);
            const feed = gtfs.transit_realtime.FeedMessage.decode(buffer);
            resolve(feed)
        }
        catch(err){
            console.error('gtfsTrip', err);
            resolve(500);
        }
    })
}

export default gtfsTrip;