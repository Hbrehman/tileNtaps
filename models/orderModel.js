const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name of user if required"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Order must belong to a User"],
  },
  cart: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Order must have shopping cart"],
  },
  totalPrice: {
    type: Number,
    required: [true, "Order must have some total price"],
  },
  deliverAddress: {
    type: Object,
    required: [true, "An order must have a delivery address"],
  },
});

orderSchema.pre("/^find/", function () {
  this.populate("user");
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
