const stripe = require("stripe")("sk_test_2qYMVsVPHvUwbOjD4SNXbpgR00MTKL4oGY");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");

module.exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //   console.log(req.body);
  const { cart } = req.body;
  const { lineItems } = req.body;

  const checkout = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: "http://127.0.0.1:8080/products.html",
    cancel_url: "http://127.0.0.1:8080/shoppingCart.html",
    customer_email: req.user.email,
    client_reference_id: "req.params.tourId",
    line_items: lineItems,
  });

  res.status(200).json({
    status: "success",
    checkout,
  });
});
