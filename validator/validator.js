const {
  validarionerrorResponse,
  badRequestResponse,
  errorResponse,
} = require("../middleware/response");

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return validarionerrorResponse(res, { message: "email is required" });
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return validarionerrorResponse(res, {
        message: "You have entered an invalid email address!",
      });
    } else if (!password) {
      return validarionerrorResponse(res, { message: "password is required" });
    } else {
      next();
    }
  } catch (error) {
    return badRequestResponse(res, {
      message: "Failed to create register!",
    });
  }
};
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return validarionerrorResponse(res, { message: "email is required" });
    } else if (!password) {
      return validarionerrorResponse(res, { message: "password is required" });
    } else {
      next();
    }
  } catch (error) {
    return errorResponse(res, { mess: "network error" });
  }
};
module.exports = { signUp, signIn };
