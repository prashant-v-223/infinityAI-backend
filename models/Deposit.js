// models/Deposit.js
const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  tx: { type: String, required: true, unique: true },
  active: { type: Number, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
