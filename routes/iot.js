const express = require('express')
const router = express.Router()
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const db = getFirestore()

router.post('/live', (req, res) => {
    const { value } = req.body
    if (!value) return res.status(400).json({
        error: 'Missing value field.'
    })

    if (isNaN(value)) return res.status(400).json({
        error: 'Value supplied is not a number.'
    })

    db.collection('temphistory').doc().set({
        temp: value,
        createdAt: FieldValue.serverTimestamp()
    })
        .then(() => {
            res.status(201).json({
                message: 'Value added to database.'
            })
        })
        .catch(() => res.status(500).json({
            error: 'Unexpected error when adding to database.'
        }))
})

router.post('/history', (req, res) => {
    const { value } = req.body
    if (!value) return res.status(400).json({
        error: 'Missing value field.'
    })

    if (isNaN(value)) return res.status(400).json({
        error: 'Value supplied is not a number.'
    })

    db.collection('settings').doc('livetemp').set({
        temp: value
    })
        .then(() => {
            res.status(201).json({
                message: 'Value updated.'
            })
        })
        .catch(() => res.status(500).json({
            error: 'Unexpected error when adding to database.'
        }))
})

module.exports = router