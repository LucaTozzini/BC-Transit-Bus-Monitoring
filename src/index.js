import express from 'express'
import ejs from 'ejs'

import nextRouter from './routes/next.routes.js'
import dataRouter from './routes/data.routes.js'
import defaultRouter from './routes/default.routes.js'
import mapRouter from './routes/map.routes.js'

const app = express()
const PORT = 80

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static('public'))

app.use('/', defaultRouter)
app.use('/next', nextRouter)
app.use('/data', dataRouter)
app.use('/map', mapRouter)

app.listen(PORT, (err) => {
    err ? console.error(err.message) : console.log('Server Listening On Port', PORT)
})