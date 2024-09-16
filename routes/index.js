const express = require('express')

const router = express.Router()

const register = require('./register')

const staking = require('./staking')

const Withdraw = require('./withdraw12')

const admin = require('./admin')

const depositRoutes = require('./depositRoutes')

const user = require('./user')

router.use('/registration', register)

router.use('/staking', staking)

router.use('/user', user)

router.use('/depositdata', depositRoutes)

router.use('/admin', admin)

router.use('/Withdraw', Withdraw)

module.exports = router