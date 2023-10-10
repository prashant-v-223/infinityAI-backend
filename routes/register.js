const express = require("express");
const router = express.Router();
const validator = require("../validator/validator");
const registerController = require("../controllers/register");
const StakingController = require("../controllers/Staking");

router.post("/signUp", validator.signUp, (req, res) => {
  return registerController.register.signUp(req, res);
});
router.get("/demo", validator.signUp, (req, res) => {
      return res.status(200).json({ status: 1});
});
router.post("/signUp1", validator.signUp, (req, res) => {
  return registerController.register.signUp(req, res);
});
router.get("/signUp/varify:Token", (req, res) => {
  return registerController.register.mailVarify(req, res);
});
router.get("/profile:Token", (req, res) => {
  return registerController.register.profile(req, res);
});
router.post("/signIn", validator.signIn, (req, res) => {
  return registerController.register.signIn(req, res);
});
router.put("/forgotPassword", (req, res) => {
  return registerController.register.forgotPassword(req, res);
});
router.post("/profileupdate", (req, res) => {
  return registerController.register.profileupdate(req, res);
});
router.post("/changepassword", (req, res) => {
  return registerController.register.changePassword(req, res);
});
router.post("/addTicket", (req, res) => {
  return registerController.register.addTicket(req, res);
});
router.get("/livaprice", (req, res) => {
  return StakingController.stack.livaprice(req, res);
});

module.exports = router;
