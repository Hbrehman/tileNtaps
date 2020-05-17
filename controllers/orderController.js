const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const Order = require("./../models/orderModel");
const User = require("./../models/userModel");

module.exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { cart } = req.body;
  const { lineItems } = req.body;
  // console.log(cart);
  const checkout = await stripe.checkout.sessions.create({
    billing_address_collection: "auto",
    shipping_address_collection: {
      allowed_countries: ["PK"],
    },
    payment_method_types: ["card"],
    success_url: `https://hbrehman.github.io/frontendTileNTaps/products.html`,
    cancel_url:
      "https://hbrehman.github.io/frontendTileNTaps/shoppingCart.html",
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    line_items: lineItems,
  });

  res.status(200).json({
    status: "success",
    checkout,
  });
});

// module.exports.createOrderCheckout = catchAsync(async (req, res, next) => {
//   const { totalPrice, totalQty } = req.query;
//   console.log(req.user);
//   if (totalPrice && totalQty) {
//     console.log(totalPrice, totalQty, req.user._id);
//     await Order.create({ totalPrice, totalQty });
//   }
//   next();
// });

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
  console.log(session);
  const items = session.display_items;
  const customerEmail = session.customer_email;
  const customerAddress = session.shipping.address;
  const customerName = session.shipping.name;
  const cusotmerId = session.client_reference_id;
  const totalPrice = 0;
  items.forEach((el) => {
    totalPrice += el.amount;
  });

  const user = await User.findById(cusotmerId);

  console.log("Here goes useful information");
  console.log({
    user,
    item,
    customerEmail,
    customerName,
    customerAddress,
    totalPrice,
  });
}
