const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product must have a name"],
    unique: true,
    minlength: 5,
    maxlength: 70,
  },
  price: {
    type: Number,
    required: [true, "Product must have a price"],
    min: 1,
  },
  slug: String,
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // this keyword only points to current document when new Document is created
        return val < this.price;
      },
      message: "Discount price ({VALUE}) should be below regular price.",
    },
  },
  type: {
    //   whether it is kitchen tile, bath tile, floor tile, etc
    type: String,
    required: [true, "Product must have a type"],
    minlength: 5,
    maxlength: 50,
  },
  description: {
    type: String,
    required: [true, "Please provide description for product"],
    minlength: 50,
    maxlength: 255,
  },
  summary: {
    type: String,
    required: [true, "Please provide summary for product"],
    minlength: 25,
    maxlength: 200,
  },
  company: {
    type: String,
    required: [true, "Product must have a company"],
    minlength: 5,
    maxlength: 50,
  },
  model: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  category: {
    type: String,
    enum: ["tile", "taps", "sanitaryWare"],
    required: [
      true,
      "A Product must have a category either tile, taps or sanitaryWare",
    ],
  },
  imageCover: {
    type: String,
    // required: [true, "A Product must have a cover image"],
  },
  images: [String],
  size: {
    type: String,
  },
});

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
