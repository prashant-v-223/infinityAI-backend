const express = require('express');
const { createDeposit, getDeposit, updateDeposit, getDepositall } = require('../controllers/withdraw123');

const router = express.Router()

router.get('/withdraw', getDeposit);
router.post('/withdraw', createDeposit);
router.get('/allwithdraw', getDepositall);
router.put('/withdraw/:id', updateDeposit);

module.exports = router;
