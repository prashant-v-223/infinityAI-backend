'use strict'
const mongoose = require('mongoose')

mongoose.set("strictQuery", false)

try {

    mongoose.connect(process.env.DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false, // Add this line
    })

    const db = mongoose.connection

    db.once('open', function () {
        console.log('Database connected successfully!')
    })

} catch (error) {
    db.on('error', console.error.bind(console, 'Database connection failed'))
}