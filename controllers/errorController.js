const AppError = require("./../utils/appError");

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log("ERROR!!", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
}

function handleDuplicateErrorDB(err) {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate Field value: ${value} please use another value`;
  return new AppError(message, 400);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.code === 11000) error = handleDuplicateErrorDB(error);

    sendErrorProd(error, res);
  }
};
