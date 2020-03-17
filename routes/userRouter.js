const express = require("express");
const router = express.Router();

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

router.post("/signup", authController.SignUp);
router.post("/login", authController.logIn);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);
router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router.patch(
  "/updateMe",
  authController.protect,
  authController.protect,
  userController.updateMe
);
router.delete(
  "/deleteMe",
  authController.protect,
  authController.protect,
  userController.deleteMe
);

router.get("/getAllUsers", userController.getAllUsers);

router.post("/createRegUser", userController.createUser);
router.post("/createAdminUser", userController.createUser);

module.exports = router;
