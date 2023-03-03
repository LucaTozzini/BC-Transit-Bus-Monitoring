import ejs from 'ejs';
import express from 'express';
import useragent from 'express-useragent';

import updateGtfsrt from './helpers/update-gtfsrt.helpers.js';

import mapRouter from './routes/map.routes.js';
import dataRouter from './routes/data.routes.js';
import defaultRouter from './routes/default.routes.js';

const app = express();
const PORT = 80;


app.use(express.json());
app.use(useragent.express());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', defaultRouter);
app.use('/data', dataRouter);
app.use('/map', mapRouter);

app.listen(PORT, (err) => {
    err ? console.error(err.message) : console.log('Server Listening On Port', PORT);
})

// Start Gtfrt Updater
updateGtfsrt(10)