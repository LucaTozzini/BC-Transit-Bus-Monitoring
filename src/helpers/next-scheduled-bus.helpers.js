import moment from 'moment';

// #4 at Uvic Exchange
let schedule = [
    '00:07', '05:55', '06:14', '06:34', '06:52', '07:07', '07:22', 
    '07:36', '07:49', '08:03', '08:18', '08:33', '08:48', '09:03', '09:19', '09:35', '09:50', 
    '10:05', '10:20', '10:35', '10:48', '11:03', '11:17', '11:32', '11:47', '12:02', '12:17', 
    '12:32', '12:46', '13:01', '13:16', '13:31', '13:46', '14:01', '14:10', '14:19', '14:28', 
    '14:38', '14:48', '14:50', '14:58', '15:08', '15:18', '15:28', '15:38', '15:48', '15:58', 
    '16:08', '16:18', '16:29', '16:39', '16:50', '17:02', '17:13', '17:23', '17:34', '17:50', 
    '18:06', '18:21', '18:37', '18:52', '19:07', '19:22', '19:37', '19:53', '20:08', '20:23', 
    '20:42', '21:02', '21:22', '21:44', '22:04', '22:34', '23:05', '23:36',
];

function nextScheduledBus(){
    let next = null;
    const curr = moment().format('HH:mm')
    for(const time of schedule){
        const isAfter = curr < time;
        if(isAfter){
            next = time;
            break;
        }
    }
    if(next === null){
        return null;
    }
    
    const start = moment(curr, 'HH:mm');
    const end = moment(next, 'HH:mm');
    
    const duration = moment.duration(end.diff(start));
    
    return {
        next_bus_time: next, 
        minutes_to_next: duration.asMinutes()
    };
}

export default nextScheduledBus
