// routes/depositRoutes.js
const express = require('express');
const { createDeposit, getDeposit } = require('../controllers/depositController');
const router = express.Router();

router.post('/deposit', createDeposit);
router.get('/deposit', getDeposit);
router.get('/alldeposit', getDeposit);

module.exports = router;
