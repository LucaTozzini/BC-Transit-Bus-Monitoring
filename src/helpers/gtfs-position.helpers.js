import getEntity from './get-Gtfsrt-Entity-FromUrl.helpers.js';

const binUrl = {
    BC_Transit_Kelowna: 'https://kelowna.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',
    BC_Transit_Nanaimo: 'https://nanaimo.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',
    BC_Transit_Squamish: 'https://squamish.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',
    BC_Transit_Kamloops: 'https://kamloops.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',
    BC_Transit_Victoria: 'https://victoria.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',
    BC_Transit_Whistler: 'https://whistler.mapstrat.com/current/gtfrealtime_VehiclePositions.bin',
    BC_Transit_Port_Alberni: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=11',
    BC_Transit_Fort_St_John: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=28',
    BC_Transit_Powell_River: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=29',
    BC_Transit_West_Kootenay: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=20',
    BC_Transit_Prince_George: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=22',
    BC_Transit_Prince_Rupert: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=23',
    BC_Transit_Campbell_River: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=12',
    BC_Transit_Sunshine_Coast: 'https://bct.tmix.se/gtfs-realtime/vehicleupdates.pb?operatorIds=18',

}

function gtfsPosition(){
    return new Promise(async resolve => {
        let positions = [];
        for(const provider in binUrl){
            let entity = await getEntity(binUrl[provider]);
            entity = entity.map(object => {
                return {...object, provider}
            })
            positions.push(entity);
        }
        positions = positions.reduce((acc, cur) => acc.concat(cur), []).filter(obj => obj.vehicle.stopId > 0 && obj.vehicle.hasOwnProperty('position') && obj.vehicle.hasOwnProperty('trip'));
        resolve(positions)
    })
}

export default gtfsPosition;