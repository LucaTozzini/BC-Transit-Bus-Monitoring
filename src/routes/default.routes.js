import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
    // const welcomeMessage = `
    // Hey, welcome to the "Bus Punctuality Monitoring Project" <br>
    // <br>
    // For next scheduled arrival got to:<br>
    // /next <br>
    // <br>
    // For real time data of transit in Victoria go to: <br>
    // /data/trip-updates<br>
    // /data/positions<br>
    // /data/stops<br>
    // `
    // res.status(200).send(welcomeMessage)
    res.render('landing')
})

export default router