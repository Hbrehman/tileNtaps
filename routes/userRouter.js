const express = require("express");
const router = express.Router();

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

router.post("/signup", authController.SignUp);
router.post("/login", authController.logIn);

router.post("/createRegUser", userController.createUser);
router.get("/getRegUsers", authController.protect, userController.getRegUsers);
router.post("/createAdminUser", userController.createUser);

module.exports = router;
