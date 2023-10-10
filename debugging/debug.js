const debug = require("debug");

const info = debug("info"),
    errors = debug("error"),
    email = debug("email"),
    mongooseDebug = debug("mongoose");

module.exports = { info, errors, email, mongooseDebug };
