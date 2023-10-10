const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Ewallateesc = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
    balace: {
      type: Number,
      default: 0,
      required: true,
    },
    Usernameby: {
      type: String,
    },
    type: {
      type: Number,
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

module.exports = mongoose.model("Ewallate", Ewallateesc);
