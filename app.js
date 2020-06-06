const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const globalErrorHandler = require("./controllers/errorController");
const orderController = require("./controllers/orderController");
const AppError = require("./utils/appError");
const compression = require("compression");
const app = express();

const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");

// app.enable("trust proxy");

if (process.env.NODE_ENV === "production") {
  // For production Environment

  var whitelist = ["https://tilentaps.com", "https://admin.tilentaps.com"];
  var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (whitelist.indexOf(req.header("Origin")) !== -1) {
      corsOptions = { credentials: true, origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };

  app.use(cors(corsOptionsDelegate));

  // app.use(
  //   cors({
  //     credentials: true,
  //     origin: "https://tilentaps.com",
  //   })
  // );
} else if (process.env.NODE_ENV === "development") {
  // For Development environment
  app.use(
    cors({
      credentials: true,
      origin: "http://127.0.0.1:5501",
    })
  );
}

// Cookie parser
app.use(cookieParser());

// Middleware to serve static content
app.use(express.static(`${__dirname}/public`));

// Set security HTTP Headers
// app.use(helmet());

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  orderController.webhookCheckout
);

// Body parser, reading data from the body into req.body
// app.use(express.json({ limit: "10kb" }));
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: ["duration"]
//   })
// );
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(compression());

app.all("*", (req, res, next) => {
  // var origin = req.protocol + "://" + req.get("host") + req.originalUrl;
  // console.log(fullUrl);
  // var origin = req.get("origin");
  // var origin = req.headers.origin;
  // console.log(origin, "origin");

  // console.log(req.body);

  console.log("cookies", req.cookies);
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `There is no route for ${req.originalUrl} on this server!`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
