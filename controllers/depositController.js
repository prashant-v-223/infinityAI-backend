// controllers/depositController.js
const Deposit = require('../models/Deposit');
const { successResponse, badRequestResponse, errorResponse } = require('../middleware/response');
const { tokenverify } = require('../middleware/token');


exports.createDeposit = async (req, res) => {
  try {
    const { amount, tx, active } = req.body;

    // Validate the request body
    if (!amount || !tx) {
      return badRequestResponse(res, { message: "Amount and transaction ID are required." });
    }

    // Extract and verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return badRequestResponse(res, { message: "No token provided or incorrect format." });
    }

    const token = authHeader.split(' ')[1];
    let { err, decoded } = await tokenverify(token);

    if (err) {
      return errorResponse(err, res);
    }

    // Create a new deposit
    const deposit = new Deposit({
      userId: decoded.profile._id,  // Ensure `decoded.profile._id` is available in your token verification
      amount: parseFloat(amount),  // Convert amount to number
      tx,
      active: Boolean(active)  // Convert active to boolean
    });

    await deposit.save();

    return successResponse(res, { message: "Deposit created successfully", deposit });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.getDeposit = async (req, res) => {
  try {
    // Verify the token
    if (req.headers.authorization) {
      let { err, decoded } = await tokenverify(req.headers.authorization.split(" ")[1]);
      if (err) {
        return errorResponse(err, res);
      }
      console.log("decoded", decoded.profile._id);

      // Create a new deposit
      const deposit = await Deposit.find({
        userId: decoded.profile._id,
      });

      return successResponse(res, { message: "Deposit created successfully", deposit });
    } else {
      return badRequestResponse(res, { message: "No token provided." });
    }
  } catch (error) {
    return errorResponse(error, res);
  }
};
