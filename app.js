const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { initializeApp, cert } = require('firebase-admin/app')
const serviceAccount = require('./firestore.json')

require('dotenv').config()

const app = express()

initializeApp({ credential: cert(serviceAccount) })

// Check env and set origin
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Import routes
app.use('/api/v1/payment/', require('./routes/payment'))
app.use('/api/v1/mfa/', require('./routes/mfa'))
app.use('/api/v1/user/', require('./routes/user'))
app.use('/api/v1/iot/', require('./routes/iot'))

// Scheduled functions
require('./cronjobs/expiredReservations')

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: 8080`)
})