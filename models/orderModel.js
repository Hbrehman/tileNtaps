const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Order must belong to a User"],
  },
  //   cart: {
  //     type: Object,
  //     required: [true, "Order must be associated with a shopping cart"],
  //   },
  price: {
    type: String,
  },
});

orderSchema.pre("/^find/", function () {
  this.populate("user");
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
