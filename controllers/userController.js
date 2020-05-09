const _ = require("underscore");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// Multer filter
const multerFilter = (req, file, cb) => {
  // Goal of call back is to test if uploaded file is an image and if so then we pass true into the callback function if not we will pass false alongwith error
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Error uploading file...", false);
  }
};

// Here I have commented out multerStorage and wrote a new line in which we define memoryStorage which simply means that the file is not written on disk but kept on storage for further processing like resizing. With multerStorage file is stored in memory

const multerStorage = multer.memoryStorage();

// Uploading images using multer package
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload.single("profilePic") here profilePic is name of file input type used to upload image
exports.uploadProfilePic = upload.single("photo");

// resize users photo

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  const randomNumber = parseInt(Math.random() * 1000000000000);
  req.file.filename = `user-${randomNumber}-${Date.now()}.jpeg`;
  // Calling the sharp function like this will create an object on which we can chain multiple methods in order to do our image processing
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ qaulity: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

exports.createUser = catchAsync(async (req, res, next) => {
  let photo;
  if (req.file) {
    photo = req.file.filename;
  }
  const user = await User.create({
    isVerified: true,
    photo,
    ..._.pick(req.body, ["name", "email", "password", "passwordConfirm"]),
  });
  res.status(201).json({
    status: "success",
    message: "User created successfully...",
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  let photo;
  let user;
  if (req.file) {
    photo = req.file.filename;
  }
  if (photo) {
    user = await User.findByIdAndUpdate(userId, {
      photo,
      ..._.pick(req.body, ["name", "email", "password", "passwordConfirm"]),
    });
  } else {
    user = await User.findByIdAndUpdate(
      userId,
      _.pick(req.body, ["name", "email", "password", "passwordConfirm"])
    );
  }

  if (!user) {
    return new AppError("User with given Id does not exit", 404);
  }

  res.status(200).json({
    status: "success",
    message: "User updated successfully...",
    data: user,
  });
});

// Delete user
exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  user = await User.findByIdAndUpdate(userId, { active: false });

  if (!user) {
    return new AppError("User with given Id does not exit", 404);
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully...",
  });
};

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
};

exports.getOneUsers = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return new AppError("There is no user with given id.", 404);

  res.status(200).json({
    status: "success",
    data: user,
  });
};

exports.getMe = async (req, res, next) => {
  // console.log(req.user);
  res.status(200).json({
    status: "success",
    data: req.user,
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword",
        400
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    _.pick(req.body, ["name", "email"]),
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
