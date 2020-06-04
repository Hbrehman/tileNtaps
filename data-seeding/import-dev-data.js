const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Products = require("./../models/productModel");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successfull");
  })
  .catch((err) => {
    console.log(err);
  });

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);

async function importData() {
  try {
    await Products.create(products, { validateBeforeSave: false });

    console.log("Data imported successfully...");
  } catch (ex) {
    console.log(ex);
  }
  process.exit();
}

async function deleteData() {
  try {
    await Products.deleteMany();

    console.log("Data deleted successfully...");
  } catch (ex) {
    console.log(ex);
  }
  process.exit();
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
