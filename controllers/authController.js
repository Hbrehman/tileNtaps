const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const _ = require("underscore");
const AppError = require("./../utils/appError");

module.exports.SignUp = catchAsync(async (req, res, next) => {
  const user = await User.create(
    _.pick(req.body, ["name", "email", "password", "passwordConfirm"])
  );

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
  res.status(201).json({
    status: "success",
    token,
    data: user
  });
});

module.exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide Email and Password."));
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Invalid Email or Password."));
  }

  //   user = user.select("-password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
  res.status(201).json({
    status: "success",
    token,
    data: user
  });
});

module.exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //   1) Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged In! Please log in to get access", 401)
    );
  }

  //   2) Check if token is valid token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  //   3) check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("User belonging to this token does not exist!", 401)
    );
  // check whether user has changed his Password or not
  if (!currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed his password Please log In again",
        401
      )
    );
  }

  req.user = currentUser;
  next();
});
