const express = require("express");
const app = express();
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const users = require("./routes/userRouter");

app.use(express.json());

app.use("/api/v1/users", users);

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
