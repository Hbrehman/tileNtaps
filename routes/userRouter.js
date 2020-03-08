const express = require("express");
const router = express.Router();

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

router.post("/signUp", authController.SignUp);

router.post("/createRegUser", userController.createUser);
router.get("/getRegUsers", userController.getRegUsers);
router.post("/createAdminUser", userController.createUser);

module.exports = router;
