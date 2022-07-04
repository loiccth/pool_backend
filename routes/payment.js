const express = require('express')
const router = express.Router()
const twilio = require('twilio')
const stripe = require('stripe')(process.env.STRIPE_TEST_API)
const mailgun = require("mailgun-js")
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })

router.post('/reservation', (req, res) => {
    const { complex, reservationDetails, price, discount, phone, email } = req.body
    if (!complex || !reservationDetails || !price || !phone || !email) return res.sendStatus(400)

    stripe.paymentIntents.create({
        amount: price + '00',
        currency: 'usd',
        payment_method: 'pm_card_visa',
    })
        .then(() => {
            console.log('stripe ok')

            const data = {
                from: 'PiscineDansMoris <admin@piscinedansmoris.com>',
                to: 'loic_cth@live.com',
                subject: 'Reservation payment receipt',
                text: `Hello, Your payment totaled to Rs ${price - discount} was completed for reservation on ${new Date(reservationDetails.date).toDateString()} for slot ${reservationDetails.hourSlotDetail} at ${complex.name} located in ${complex.location}.`
            }
            mg.messages().send(data, function (error, body) {
                console.log(error)
                console.log(body)
            })

            const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
            client.messages.create({
                body: `Your payment totaled to Rs ${price - discount} was completed for reservation on ${new Date(reservationDetails.date).toDateString()} for slot ${reservationDetails.hourSlotDetail} at ${complex.name} located in ${complex.location}.`,
                to: '+230' + phone,
                from: 'Piscine'
            })
                .then(() => {
                    console.log('sms ok')
                    res.sendStatus(200)
                })
                .catch(err => res.sendStatus(500))
        })
        .catch(err => console.log(err))
})

router.post('/membership', (req, res) => {
    const { id, price, phone, email } = req.body
    if (!id || !price || !phone || !email) return res.sendStatus(400)

    stripe.paymentIntents.create({
        amount: price + '00',
        currency: 'usd',
        payment_method: 'pm_card_visa',
    })
        .then(() => {
            console.log('stripe ok')

            const data = {
                from: 'PiscineDansMoris <admin@piscinedansmoris.com>',
                to: 'loic_cth@live.com',
                subject: 'Reservation payment receipt',
                text: `Hello, Your payment totaled to Rs ${price} was completed for membership payment.`
            }
            mg.messages().send(data, function (error, body) {
                console.log(error)
                console.log(body)
            })

            const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
            client.messages.create({
                body: `Your payment totaled to Rs ${price} was completed for membership payment.`,
                to: '+230' + phone,
                from: 'Piscine'
            })
                .then(() => {
                    console.log('sms ok')
                    res.sendStatus(200)
                })
                .catch(err => res.sendStatus(500))
        })
        .catch(err => console.log(err))
})

module.exports = router