const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us you name"],
    minlength: 3,
    maxlength: 255,
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
    unique: true,
    maxlength: 255,
    minlength: 5,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  password: {
    type: String,
    select: false,
    minlength: 8,
    required: [true, "Please provide a password"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  role: {
    type: String,
    // select: false,
    enum: ["admin", "manager", "user"],
    default: "user",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
  verificationToken: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
    select: false,
  },
});

userSchema.pre(/^find/, async function (next) {
  // this keyword here points to current query
  this.find({
    active: { $ne: false },
    isVerified: { $ne: false },
    // role: { $ne: "admin" },
  });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (tokenIssueTime) {
  // console.log(tokenIssueTime, this.passwordChangedAt);
  return new Date(Date.now() + tokenIssueTime) < this.passwordChangedAt;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("user", userSchema);
module.exports = User;
