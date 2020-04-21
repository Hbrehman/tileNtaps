const _ = require("underscore");
const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");

exports.createUser = async (req, res, next) => {
  const user = await User.create(
    _.pick(req.body, ["name", "email", "photo", "password", "passwordConfirm"])
  );
  res.status(201).json({
    status: "success",
    message: "User created successfully...",
    data: user,
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
