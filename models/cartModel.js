const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  cart: {
    type: Object,
    required: [true, "Cart is required"],
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
