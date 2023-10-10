const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const V4XpriceSchemaDetails = new Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("V4XpriceSchemaDetails", V4XpriceSchemaDetails);
