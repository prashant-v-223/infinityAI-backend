const jwt = require("jsonwebtoken");

module.exports = {
  token: async (allRecords, record) => {
    const profile = await allRecords
      .findById(record._id)
      .select({ password: 0 });
    const token = jwt.sign({ profile }, "3700 0000 0000 002", {
      expiresIn: "24hr",
    });
    return { token };
  },
  tokenverify: async (jwtToken) => {
    return await jwt.verify(
      jwtToken,
      "3700 0000 0000 002",
      function (err, decoded) {
        return { err, decoded };
      }
    );
  },
  Forgetpasswordtoken: async (allRecords, record) => {
    const profile = await allRecords.findById(record._id);
    const token = jwt.sign({ profile }, "3700 0000 0000 002", {
      expiresIn: "1hr",
    });
    return { token };
  },
};
