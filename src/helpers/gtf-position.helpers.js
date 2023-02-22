import downloadFile from './download-file.helpres.js';
import gtfs from 'gtfs-realtime-bindings';
import fs from 'fs'

import dotenv from 'dotenv';
dotenv.config({path:'C:/Users/luca_/github/BC-Transit-Bus-Monitoring/.env'});

const fileUrl = 'http://victoria.mapstrat.com/current/gtfrealtime_VehiclePositions.bin';
const filePath = process.env.GTF_POSITION_FILE;

function gtfPosition(){
    return new Promise(async resolve => {
        try{
            // await downloadFile(fileUrl, filePath);
            const buffer = fs.readFileSync(filePath);
            const feed = gtfs.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
            resolve(feed)
        }
        catch(err){
            console.error('gtfsPositione', err.message);
            resolve(500);
        }
    })
}

export default gtfPosition;