import downloadFile from './download-file.helpres.js';
import gtfs from 'gtfs-realtime-bindings';
import fs from 'fs'

import dotenv from 'dotenv';
dotenv.config({path:'C:/Users/luca_/github/BC-Transit-Bus-Monitoring/.env'});

const fileUrl = 'http://victoria.mapstrat.com/current/gtfrealtime_TripUpdates.bin';
const filePath = process.env.GTF_UPDATE_FILE;

function gtfTrip(){
    return new Promise(async resolve => {
        try{
            const get = await downloadFile(fileUrl, filePath);
            if(get == 500){
                throw new Error('HTTP Get Fail')
            }
            const buffer = fs.readFileSync(filePath);
            const feed = gtfs.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
            resolve(feed)
        }
        catch(err){
            console.error('gtfTrip', err.message);
            resolve(500);
        }
    })
}

export default gtfTrip;