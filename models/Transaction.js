const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Transaction = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    tranforWallet: {
      type: String,
      default: 0,
      required: true,
    },
    fromaccountusername: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    Amount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", Transaction);
