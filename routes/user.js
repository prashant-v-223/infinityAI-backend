const express = require("express");
const router = express.Router();
const stackController = require("../controllers/Staking");

router.get("/allstacking", (req, res) => {
  return stackController.stack.gelallstack(req, res);
});
router.get("/gelUserWallate", (req, res) => {
  return stackController.stack.gelUserWallate(req, res);
});
router.post("/transfercoin", (req, res) => {
  return stackController.stack.Transfercoin(req, res);
});
router.get("/transfercoin", (req, res) => {
  return stackController.stack.getTransfercoinasync(req, res);
});
router.get("/mywalletbalance", (req, res) => {
  return stackController.stack.mywalletbalance(req, res);
});
router.get("/Community/Building/income", (req, res) => {
  return stackController.stack.getCommunityincome(req, res);
});
router.get("/Achievement/Building/income", (req, res) => {
  return stackController.stack.getAchievementincome(req, res);
});
router.get("/Passive/Building/income", (req, res) => {
  return stackController.stack.gePassiveincome(req, res);
});
router.get("/indaireactteam", (req, res) => {
  return stackController.stack.indaireactteam(req, res);
});
router.get("/daireactteam", (req, res) => {
  return stackController.stack.daireactteam(req, res);
});

module.exports = router;


// /user/allstacking