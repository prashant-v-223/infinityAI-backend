const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var V4XpriceSchema = new mongoose.Schema(
  {
    price: Number,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("V4Xprice", V4XpriceSchema);
