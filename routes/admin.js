const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

router.get("/allusers", (req, res) => {
  return adminController.admin.alluserdata(req, res);
});
router.get("/alltranfor", (req, res) => {
  return adminController.admin.alltranfor(req, res);
});
router.get("/AllBuystack", (req, res) => {
  return adminController.admin.AllBuystack(req, res);
});
router.post("/adminuserblock", (req, res) => {
  return adminController.admin.userblock(req, res);
});
router.post("/emailcheng", (req, res) => {
  return adminController.admin.emailcheng(req, res);
});
router.post("/userwallateblock", (req, res) => {
  return adminController.admin.userwallateblock(req, res);
});
router.get("/supportdata", (req, res) => {
  return adminController.admin.supportdata(req, res);
});
router.post("/priceV4X", (req, res) => {
  return adminController.admin.priceV4X(req, res);
});
router.get("/priceV4X", (req, res) => {
  return adminController.admin.getlive(req, res);
});
router.post("/signIn", (req, res) => {
  return adminController.admin.signIn(req, res);
});
router.post("/sendamonut", (req, res) => {
  return adminController.admin.amontsend(req, res);
});
router.post("/userRemove", (req, res) => {
  return adminController.admin.userRemove(req, res);
});
router.post("/addbenars", (req, res) => {
  return adminController.admin.Addbenars(req, res);
});
router.post("/Buystack", (req, res) => {
  return adminController.admin.Buystack(req, res);
});
router.get("/addbenars", (req, res) => {
  return adminController.admin.Getbenars(req, res);
});
router.get("/tranforcoins", (req, res) => {
  return adminController.admin.tranforcoins(req, res);
});
router.delete("/removebenars", (req, res) => {
  return adminController.admin.Removebenars(req, res);
});
module.exports = router;
