const User = require("../models/userModel");

exports.createUser = async (req, res, next) => {
  const user = await User.create(req.body); // not a good practice
  res.status(201).json({
    status: "success",
    message: "User created successfully...",
    data: user
  });
};

exports.getRegUsers = async (req, res, next) => {
  const users = await User.find({
    isAdmin: { $ne: true }
  }).select({
    isAdmin: 0,
    __v: 0
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    message: "List of All regular users",
    data: users
  });
};
