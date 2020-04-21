const _ = require("underscore");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Product = require("./../models/productModel");
module.exports.createProduct = catchAsync(async (req, res, next) => {
  const doc = await Product.create(
    _.pick(req.body, [
      "name",
      "price",
      "priceDiscount",
      "type",
      "description",
      "summary",
      "company",
      "model",
      "category",
      "imageCover",
      "images",
      "size",
    ])
  );
  res.status(201).json({
    status: "success",
    data: {
      doc,
    },
  });
});

module.exports.getAllProducts = catchAsync(async (req, res, next) => {
  const doc = await Product.find();

  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      doc,
    },
  });
});

module.exports.updateProduct = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const doc = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError("No product found with that ID", 404));
  }
  console.log(doc);

  res.status(200).json({
    status: "success",
    data: {
      doc,
    },
  });
});

module.exports.getProduct = catchAsync(async (req, res, next) => {
  const doc = await Product.findById(req.params.id);

  if (!doc) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      doc,
    },
  });
});

module.exports.deleteProduct = catchAsync(async (req, res, next) => {
  const doc = await Product.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
  });
});
