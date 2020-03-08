require("./models/db");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: "./config" });
console.log(process.env.NODE_ENV);

process.on("uncaughtException", ex => {
  console.log("Uncaught Exception! Shutting Down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("Listening on port ${port}...");
});

process.on("unhandledRejection", ex => {
  console.log("Unhandled Promise Rejection!! Shutting down.");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
