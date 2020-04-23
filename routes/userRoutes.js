const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
// Only admin should be able to access this route

router.get("/getMe", authController.protect, userController.getMe);
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    userController.createUser
  );
router.get(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getOneUsers
);

router.post("/signup", authController.SignUp);
router.get("/verifySignUp/:token", authController.redirectAfterVerification);
router.post("/login", authController.logIn);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);
router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

module.exports = router;
