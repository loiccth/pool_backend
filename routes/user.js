const express = require('express')
const router = express.Router()
const twilio = require('twilio')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
const generator = require('generate-password')
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })

const db = getFirestore()
const auth = getAuth()

router.post('/reset', async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({
        error: 'Missing email field.'
    })

    try {
        const snapshot = await db.collection('users').where('email', '==', email).get()
        if (snapshot.empty) {
            return res.status(404).json({
                error: 'Email not found.'
            })
        }
        snapshot.forEach((doc) => {
            const newPassword = generator.generate({
                length: 10,
                numbers: true
            })

            auth.updateUser(doc.id, {
                password: newPassword
            })
                .then(() => {
                    console.log(newPassword)

                    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
                    client.messages.create({
                        body: `Your new password is ${newPassword}. Please update your password after logging in.`,
                        to: '+230' + doc.data().phone,
                        from: 'Piscine'
                    })
                        .then(() => {
                            console.log('new password sms ok')

                            const data = {
                                from: 'PiscineDansMoris <admin@piscinedansmoris.com>',
                                to: 'loic_cth@live.com',
                                subject: 'Password reset',
                                text: 'Hello, a password reset was requested on your account. If it wasn\'t you, please contact us at admin@piscinedansmoris.com'
                            }
                            mg.messages().send(data, function (error, body) {
                                console.log(error)
                                console.log(body)
                            })

                            res.status(201).json({
                                msg: 'Password reset successful.'
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
    }
    catch (e) {
        res.status(500).json({
            error: 'Unexpected error.'
        })
    }
})

module.exports = router