"use strict";
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const admin = new mongoose.Schema(
  {
    email: { type: String, trim: true },
    password: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);
admin.pre("save", async function (next) {
  this.isModified("password") &&
    (this.password = await bcrypt.hash(this.password, 10));
  next();
});
module.exports = mongoose.model("admin", admin);
