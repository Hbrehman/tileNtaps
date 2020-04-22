const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const app = express();
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const compression = require("compression");

// const users = require("./routes/userRouter");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");

// Cookie parser
app.use(cookieParser());
// to handel cors issues
// app.options("*", cors());
app.use(cors({ credentials: true, origin: "http://127.0.0.1:5501" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5501");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, x-auth-token, Content-Type, Accept, Authorization"
  );
  next();
});

// Set security HTTP Headers
// app.use(helmet());

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: "10kb" }));

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
  console.log("cookies", req.cookies);
  next();
});

app.get("/getCookie", (req, res, next) => {
  res.cookie("jwt", "token", { httpOnly: false });
  res.send("cookie sent");
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
