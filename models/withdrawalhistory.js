const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const withdrawal = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    transactionshsh: {
      type: String,
      default: "",
    },
    walletaddress: {
      type: String,
      default: "",
    },
    withdrawalAmount: {
      type: Number,
      default: 0,
    },
    Admincharges: {
      type: Number,
      default: 0,
    },
    Active: {
      type: Boolean,
      default: true,
      required: true,
    },
    Remark: {
      type: String,
      default: "",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("withdrawal", withdrawal);
