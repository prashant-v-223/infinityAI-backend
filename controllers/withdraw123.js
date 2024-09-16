// controllers/depositController.js
const Deposit = require('../models/Deposit');
const { successResponse, badRequestResponse, errorResponse } = require('../middleware/response');
const { tokenverify } = require('../middleware/token');
const Wallet123 = require('../models/Wallet123');


exports.createDeposit = async (req, res) => {
  try {
    const { amount, address, active } = req.body;

    // Validate the request body

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
    const deposit = new Wallet123({
      userId: decoded.profile._id,  // Ensure `decoded.profile._id` is available in your token verification
      amount: parseFloat(amount),  // Convert amount to number
      address,
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
      console.log("decoded", "decoded.profile._id");
    if (req.headers.authorization) {
      let { err, decoded } = await tokenverify(req.headers.authorization.split(" ")[1]);
      if (err) {
        return errorResponse(err, res);
      }
      console.log("decoded", decoded.profile._id);

      // Create a new deposit
      const deposit = await Wallet123.find({
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

exports.getDepositall = async (req, res) => {
  try {
    // Verify the token

    const deposit = await Wallet123.find({
    });

    return successResponse(res, { message: "Deposit created successfully", deposit });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.updateDeposit = async (req, res) => {
  const { id } = req.params; // Assuming the deposit ID is passed as a URL parameter
  const updateData = req.body; // Assuming the data to update is passed in the request body

  try {
    // Find and update the deposit
    const updatedDeposit = await Wallet123.findByIdAndUpdate({ _id: id }, updateData, { new: true, runValidators: true });

    if (!updatedDeposit) {
      return res.status(404).json({
        status: 'error',
        message: 'Deposit not found'
      });
    }

    // Return a success response with the updated deposit
    return successResponse(res, {
      message: "Deposit updated successfully",
      deposit: updatedDeposit
    });
  } catch (error) {
    // Return an error response with the error message
    return errorResponse(res, {
      message: "An error occurred while updating the deposit",
      error: error.message
    });
  }
};