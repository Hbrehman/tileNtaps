const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    minlength: 3,
    maxlength: 255
  },
  email: {
    type: String,
    required: [true, "User must have an email address"],
    unique: true,
    maxlength: 255,
    minlength: 5
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    select: false,
    minlength: 8,
    required: [true, "User must have a password"]
  },
  passwordConfirm: {
    type: String,
    required: [true, "User must have a password"],
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: "Passwords don't match"
    }
  },
  role: {
    type: String,
    select: false,
    enum: ["admin", "manager", "user"],
    default: "user"
  },
  passwordChangedAt: Date
});

userSchema.pre("save", async function() {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.passwordChangedAt = Date.now() + 1000;
  this.passwordConfirm = undefined;
});

userSchema.methods.comparePassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(tokenIssueTime) {
  console.log(tokenIssueTime, this.passwordChangedAt);
  return new Date(Date.now() + tokenIssueTime) > this.passwordChangedAt;
};

const User = mongoose.model("user", userSchema);
module.exports = User;
