const crypto = require("crypto");
const { promisify } = require("util");
const Email = require("./../utils/email");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const _ = require("underscore");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
};

//, {expiresIn: process.env.JWT_EXPIRES_IN}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 90 * 24 * 60 * 60 * 1000
    ),
    // secure: true, // because of this option set to true, the communication will only happen on https connection on http communication will not happen
    httpOnly: true, // we set it true because the cookie can newer be accessed and modified by the browser anyway. it prevents xss attcks
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.cookie("user", user._id, { httpOnly: false });

  user.password = undefined;

  if (statusCode === 201) {
    res.writeHead(301, {
      Location: "http://127.0.0.1:8080/products.html",
    });
    return res.end();
  }

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

module.exports.SignUp = catchAsync(async (req, res, next) => {
  const user = await User.create(
    _.pick(req.body, ["name", "email", "password", "passwordConfirm"])
  );

  const jwt = signToken(user._id);

  user.verificationToken = jwt;

  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verifySignUp/${jwt}`;

  try {
    await new Email(user, url).sendVerification();
  } catch (ex) {
    console.log(ex);
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    new AppError("There was an error sending the Email! Try again later", 500);
  }

  res.status(200).json({
    status: "success",
  });
});

module.exports.redirectAfterVerification = catchAsync(
  async (req, res, next) => {
    const token = req.params.token;
    let user = await User.findOne({
      verificationToken: token,
    });
    try {
      // 1) varification token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY
      );
      if (!decoded || !user) {
        return next(new AppError("Token is invalid or has expired.", 400));
      }
    } catch (ex) {
      console.log(ex);
      return next(new AppError("Token is invalid or has expired.", 400));
    }

    user.isVerified = true;
    user = await user.save({ validateBeforeSave: false });
    const currentUser = await User.findById({ _id: user._id }).select(
      "-verificationToken"
    );
    createSendToken(currentUser, 201, res);
  }
);

module.exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide Email and Password.", 400));
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Invalid Email or Password.", 400));
  }

  //   user = user.select("-password");

  createSendToken(user, 200, res);
});

module.exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // console.log(req.cookies);

  //   1) Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

  const currentUser = await User.findById(decoded.id).select(
    "-passwordResetToken -passwordResetTokenExpire -__v"
  );
  if (!currentUser)
    return next(
      new AppError("User belonging to this token does not exist!", 401)
    );

  // 4) check whether user has changed his Password after jwt was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
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

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError("User with given email id does not exist.", 404));

  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // 3) Send it to users email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyPasswordResetToken/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email! Try again later", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

exports.verifyPasswordResetToken = catchAsync(async (req, res, next) => {
  // console.log(req.params.token);
  // Hash token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  const cookieOptions = {
    expires: new Date(Date.now + 15 * 60 * 1000),
    httpOnly: false,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("passwordResetToken", resetToken, cookieOptions);

  res.writeHead(301, {
    Location: "http://127.0.0.1:8080/products.html",
  });
  return res.end();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  // Hash token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  await user.save();
  res.cookie("passwordResetToken", "", { httpOnly: false });
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id }).select("+password");

  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};

exports.checkIfAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select("role");

  if (!(user.role === "admin")) {
    return next(
      new AppError("You do not have permission to perform this action.", 403)
    );
  }
  next();
});

exports.logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now + 60 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", "IdotYouAreLoggedOut", cookieOptions);

  res.cookie("user", "Nothing", { httpOnly: false });

  res.status(200).json({
    status: "success",
  });
});
