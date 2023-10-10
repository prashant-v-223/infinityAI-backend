const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Passive = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    Note: {
      type: String,
      default: 0,
      required: true,
    },
    Amount: {
      type: Number,
      default: 0,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    Active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Passive", Passive);
