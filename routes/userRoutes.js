const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

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

router.get("/:id", userController.getOneUsers);

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

module.exports = router;
