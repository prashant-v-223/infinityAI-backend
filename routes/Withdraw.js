const express = require("express");
const router = express.Router();
const validator = require("../validator/validator");
const WithdrawController = require("../controllers/Withdraw");

router.get("/stackingbouns", (req, res) => {
  return WithdrawController.Withdraw.Withdrawotpsend(req, res);
});
router.get("/tranferotpsend", (req, res) => {
  return WithdrawController.Withdraw.tranferotpsend(req, res);
});
router.post("/checkotp", (req, res) => {
  return WithdrawController.Withdraw.Withdrawotpcheck(req, res);
});
router.get("/mainWallet", (req, res) => {
  return WithdrawController.Withdraw.MainWallet(req, res);
});
router.get("/v4xWallet", (req, res) => {
  return WithdrawController.Withdraw.V4xWallet(req, res);
});
router.get("/Withdrdata", (req, res) => {
  return WithdrawController.Withdraw.Withdrdata(req, res);
});
router.post("/Withdrdata", (req, res) => {
  return WithdrawController.Withdraw.Withdrdata123(req, res);
});
router.get("/Withdrdatadatauser", (req, res) => {
  return WithdrawController.Withdraw.Withdrdatadatauser(req, res);
});

module.exports = router;
