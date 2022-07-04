const addMinutes = (date = new Date(), minutes) => {
    date.setMinutes(date.getMinutes() + minutes)

    return date
}

module.exports = addMinutes