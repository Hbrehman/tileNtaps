const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/tileNtaps", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Successfully connected to mongodb...");
  })
  .catch(() => {
    console.log("Problem connecting to mongodb...");
  });
