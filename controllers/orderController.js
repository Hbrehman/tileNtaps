const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const Order = require("./../models/orderModel");
const User = require("./../models/userModel");
const Cart = require("./../models/cartModel");

module.exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  let { cart } = req.body;
  cart = await Cart.create({ cart });

  cartId = `${cart._id}`;
  const { lineItems } = req.body;

  const checkout = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    shipping_address_collection: {
      allowed_countries: ["PK"],
    },
    payment_method_types: ["card"],
    success_url: `https://tilentaps.com`,
    cancel_url: "https://tilentaps.com/shoppingCart.html",
    customer_email: req.user.email,
    client_reference_id: cartId,
    line_items: lineItems,
  });

  res.status(200).json({
    status: "success",
    checkout,
  });
});

exports.webhookCheckout = (req, res, next) => {
  let event;
  const signature = req.headers["stripe-signature"];
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (ex) {
    return res.status(400).send(`Webhook error: ${ex.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createBookingCehckout(event.data.object);
  }
  res.status(200).json({ received: true });
};

async function createBookingCehckout(session) {
  const items = session.display_items;
  const customerEmail = session.customer_email;
  const deliveryAddress = session.shipping.address;
  const name = session.shipping.name;
  const cart = session.client_reference_id;

  let totalPrice = 0;
  items.forEach((el) => {
    totalPrice += el.amount;
  });

  totalPrice /= 100;

  let user = await User.findOne({ email: customerEmail });

  const order = await Order.create({
    cart,
    user,
    deliveryAddress,
    totalPrice,
    name,
  });
  console.log(order);
}
