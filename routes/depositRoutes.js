const express = require('express');
const { createDeposit, getDeposit, updateDeposit, getDepositall } = require('../controllers/depositController');

const router = express.Router()

router.post('/deposit', createDeposit);
router.get('/deposit', getDeposit);
router.get('/alldeposit', getDepositall);
router.put('/deposits/:id', updateDeposit);

module.exports = router;
