const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

function filterObj(obj, ...requiredData) {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (requiredData.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
}

module.exports.SignUp = catchAsync(async (req, res, next) => {
  const obj = { ...req.body };
  const filteredObj = filterObj(
    obj,
    "name",
    "email",
    "password",
    "passwordConfirm"
  );
  const user = await User.create(filteredObj);
  console.log(user);
  res.status(201).json({
    status: "success",
    data: user
  });
});
