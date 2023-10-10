const express = require("express");
const router = express.Router();
const validator = require("../validator/validator");
const stackController = require("../controllers/Staking");

router.post("/addstacking", (req, res) => {
  return stackController.stack.Buystack(req, res);
});
router.get("/stackingbouns", (req, res) => {
  return stackController.stack.getstackbouns(req, res);
});
router.get("/allicome", (req, res) => {
  return stackController.stack.allincome(req, res);
});
router.get("/allicome1", (req, res) => {
  return stackController.stack.userallincome(req, res);
});

// router.get("/signUp/varify:Token", (req, res) => {
//   return registerController.register.mailVarify(req, res);
// });
// router.post("/signIn", validator.signIn, (req, res) => {
//   return registerController.register.signIn(req, res);
// });
// router.put("/forgotPassword", (req, res) => {
//   return registerController.register.forgotPassword(req, res);
// });
// router.post("/changepassword", (req, res) => {
//   return registerController.register.changePassword(req, res);
// });

module.exports = router;
