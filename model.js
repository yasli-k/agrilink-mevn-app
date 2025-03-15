const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;
require("dotenv").config();

// console.log(process.env);

// console.log("DBPASSWORDS:", process.env.DBPASSWORDS);
// Log the URI to debug
console.log("MongoDB URI:", process.env.DBPASSWORDS);
mongoose
  .connect(process.env.DBPASSWORDS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const farmerSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Farmer must have a first name"],
  },
  lastName: {
    type: String,
    required: [true, "Farmer must have a last name"],
  },
  username: {
    type: String,
    required: [true, "Farmer must have a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, " Farmer must have an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Farmer must have a password"],
  },
});

const productSchema = new Schema({
  productName: {
    type: String,
    required: [true, "Product must have a name"],
  },
  description: {
    type: String,
    required: [true, "Product must have a description"],
  },
  price: {
    type: Number,
    required: [true, "Product must have a price"],
  },
  imageURL: {
    type: String,
    required: [true, "Product must have an image"],
  },
  location: {
    type: String,
    required: [true, "Product must have a location"],
  },

  quantity: {
    type: Number,
    required: [true, "Product must have a quantity"],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Farmer",
    required: [true, "Product must have a farmer/owner"],
  },
});

farmerSchema.methods.setPassword = async function (plainPassword) {
  try {
    const encryptedPassword = await bcrypt.hash(plainPassword, 10);
    this.password = encryptedPassword;
  } catch (error) {
    console.log("invalid password, can't set password");
  }
};
farmerSchema.methods.verifyPassword = async function (plainPassword) {
  let isOkay = await bcrypt.compare(plainPassword, this.password);
  return isOkay;
};

const Farmer = mongoose.model("Farmer", farmerSchema);
const Product = mongoose.model("Product", productSchema);

module.exports = {
  Farmer,
  Product,
};
