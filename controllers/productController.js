const _ = require("underscore");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const Product = require("./../models/productModel");
const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-1",
});
// Multer filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Error uploading file...", false);
  }
};

const multerStorage = multer.memoryStorage();

// Uploading images using multer package
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// exports.uploadProductCoverImage = upload.single("imageCover");

exports.uploadProductImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

// upload.array('images', 3)

// resize users photo

exports.resizeProductImage = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // cover Image

  const randomNumber = parseInt(Math.random() * 1000000000000);
  req.body.imageCover = `product-${randomNumber}-${Date.now()}-cover.jpeg`;

  sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ qaulity: 99 })
    .toBuffer()
    .then((data) => {
      let s3bucket = new AWS.S3();
      let imgFolder = "img";
      let subFolder = "products";
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        ACL: "public-read",
        Key: `${imgFolder}/${subFolder}/${req.body.imageCover}`,
        Body: data,
      };

      s3bucket.putObject(params, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(
            `Successfully uploaded data to ${process.env.S3_BUCKET_NAME}/${imgFolder}/${subFolder}/${req.body.imageCover}`
          );
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // .toFile(`public/img/products/${req.body.imageCover}`);

  // other images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const randomNumber = parseInt(Math.random() * 1000000000000);
      const fileName = `product-${randomNumber}-${Date.now()}-${i + 1}.jpeg`;
      sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ qaulity: 99 })
        .toBuffer()
        .then((data) => {
          let s3bucket = new AWS.S3();
          let imgFolder = "img";
          let subFolder = "products";
          const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            ACL: "public-read",
            Key: `${imgFolder}/${subFolder}/${fileName}`,
            Body: data,
          };

          s3bucket.putObject(params, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(
                `Successfully uploaded data to ${process.env.S3_BUCKET_NAME}/${imgFolder}/${subFolder}/${fileName}`
              );
            }
          });
        })
        .catch((err) => {
          console.log(error);
        });
      // .toFile(`public/img/products/${fileName}`);

      req.body.images.push(fileName);
    })
  );
  next();
});

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
