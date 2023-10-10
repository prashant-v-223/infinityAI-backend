const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StakingBonus = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rewordId: {
      type: Schema.Types.ObjectId,
      ref: "Staking",
    },
    ReffId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    Amount: {
      type: Number,
      default: 0,
      required: true,
    },
    Note: {
      type: String,
      required: true,
    },
    V4xTokenPrice: {
      type: Number,
    },
    Active: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StakingBonus", StakingBonus);
