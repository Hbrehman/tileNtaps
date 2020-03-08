const mongoose = require("mongoose");

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
  }
});

userSchema.methods.getAuthenticationToken = function() {
  // return
};

const User = mongoose.model("user", userSchema);
module.exports = User;
