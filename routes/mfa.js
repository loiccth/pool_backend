const express = require('express')
const router = express.Router()
const twilio = require('twilio')
const { getFirestore } = require('firebase-admin/firestore')
const addMinutes = require('../utils/addMinutes')

const db = getFirestore()

router.post('/generate', (req, res) => {
    const { email, phone } = req.body
    if (!email || !phone) return res.status(400).json({
        error: 'Missing email and/or phone number'
    })

    const mfa = Math.floor(Math.random() * 1000000)
    const deadDate = addMinutes(new Date(), 15)

    db.collection('mfa').doc(email).delete()
        .then(() => {
            db.collection('mfa').doc(email).set({
                code: mfa,
                expiry: deadDate.toISOString()
            })
                .then(() => {
                    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
                    client.messages.create({
                        body: `Your MFA code is ${mfa} and is valid till ${deadDate.toLocaleTimeString()}`,
                        to: '+230' + phone,
                        from: 'Piscine'
                    })
                        .then(() => {
                            console.log('mfa sms ok')
                            res.status(201).json({
                                msg: 'MFA code sent.'
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(400).json({
                                error: 'Cannot deliver SMS to user\'s phone number.'
                            })
                        })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err.messages
                    })
                })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err.messages
            })
        })
})

module.exports = router