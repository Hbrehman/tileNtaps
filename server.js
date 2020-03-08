const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
require("./models/db");
const app = require("./app");
console.log(process.env.NODE_ENV);

process.on("uncaughtException", ex => {
  console.log("Uncaught Exception! Shutting Down...");
  console.log(ex.name, ex.message);
  process.exit(1);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

process.on("unhandledRejection", ex => {
  console.log("Unhandled Promise Rejection!! Shutting down.");
  console.log(ex.name, ex.message);
  server.close(() => {
    process.exit(1);
  });
});
