const { CronJob } = require('cron')
const { getFirestore } = require('firebase-admin/firestore')
const db = getFirestore()

const expiredReservations = new CronJob('*/1 * * * *', async () => {
    const today = Date.now() - 43200000

    try {
        const snapshot = await db.collection('reservations').where('status', '==', 'A').where('date', '<', today).get()
        snapshot.forEach((doc) => {
            db.collection('reservations').doc(doc.id).update({
                status: 'Expired'
            })
        })
    }
    catch (e) {
        console.log(e)
    }

}, null, true, 'Indian/Mauritius')

module.exports = expiredReservations