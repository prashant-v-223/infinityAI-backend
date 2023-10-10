const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Bannars = new Schema(
  {
    img: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bannars", Bannars);
