import gtfs from 'gtfs-realtime-bindings';
import downloadFile from "./download-file.helpres.js";

function getEntity(url){
    return new Promise(async resolve => {
        try{
            const buffer = await downloadFile(url);
            if(buffer == 500) throw new Error('Buffer Error')
            const entity = (gtfs.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))).entity;
            resolve(entity);
        }
        catch(err){
            console.error(err.message);
        }
    })
}

export default getEntity;