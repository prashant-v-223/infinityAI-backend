const express = require('express')

const router = express.Router()
const { createDeposit, getDeposit, getDepositall, updateDeposit } = require('../controllers/depositController');
const depositController = require('../controllers/depositController'); // Ensure this path is correct

router.post('/deposit', createDeposit);
router.get('/deposit', getDeposit);
router.get('/alldeposit', getDepositall);
router.put('/deposits/:id', depositController.updateDeposit);

module.exports = router;
