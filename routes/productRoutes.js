const express = require("express");
const productController = require("./../controllers/productController");
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");
const router = express.Router();

router
  .route("/")
  .post(
    // authController.protect,
    // authController.restrictTo("admin"),
    productController.uploadProductImages,
    productController.resizeProductImage,
    productController.createProduct
  )
  .get(productController.getAllProducts);

router
  .route("/:id")
  .patch(
    // authController.protect,
    // authController.restrictTo("admin"),
    productController.uploadProductImages,
    productController.resizeProductImage,
    productController.updateProduct
  )
  .get(
    // authController.protect,
    // authController.restrictTo("admin"),
    productController.getProduct
  )
  .delete(
    // authController.protect,
    // authController.restrictTo("admin"),
    productController.deleteProduct
  );

module.exports = router;
