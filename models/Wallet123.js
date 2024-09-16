// models/Deposit.js
const mongoose = require('mongoose');

const Wallet123Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  active: { type: Number, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Wallet123', Wallet123Schema);
