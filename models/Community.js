const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Community = new Schema(
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
    Usernameby: {
      type: String,
      ref: "user",
    },
    Amount: {
      type: Number,
      default: 0,
      required: true,
    },
    Active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("community", Community);
