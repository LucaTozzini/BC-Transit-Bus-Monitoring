import downloadFile from './download-file.helpres.js';
import gtfs from 'gtfs-realtime-bindings';


const binUrl = {
    BC_Transit_Victoria: 'http://victoria.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',

}

function gtfsPosition(){
    return new Promise(async resolve => {
        try{
            const buffer = await downloadFile(fileUrl);
            if(buffer == 500){
                throw new Error('HTTP Get Fail')
            }
            const feed = gtfs.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
            resolve(feed)
        }
        catch(err){
            console.error('gtfPosition', err.message);
            resolve(500);
        }
    })
}



export default gtfsPosition;