const express = require("express");
const cors = require("cors");
const model = require("./model");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
// const port = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:8080", // For local dev
  "https://your-frontend.onrender.com", // Replace with your actual frontend URL
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "fdejrwufhu4yhe",
    saveUninitialized: true,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.DBPASSWORDS, // Your MongoDB connection string
      collectionName: "sessions", // Optional: custom collection name
    }),
  })
);

async function AuthMiddleware(req, res, next) {
  console.log("Session in AuthMiddleware:", req.session);
  if (req.session && req.session.farmerID) {
    let farmer = await model.Farmer.findOne({ _id: req.session.farmerID });
    if (!farmer) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.farmer = farmer;
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
//signingup
app.get("/farmer", async (req, res) => {
  try {
    let farmers = await model.Farmer.find({}, { password: 0 }); //??????
    res.send(farmers);
  } catch (error) {
    res.status(404).send("No farmers found");
  }
});

//products created by farmer
app.get("/farmer/products", AuthMiddleware, async (req, res) => {
  try {
    let products = await model.Product.find({ owner: req.session.farmerID });
    if (!products) {
      return res.status(404).send("No products found");
    }
    res.send(products);
  } catch (error) {
    res.status(404).send("No products found");
  }
});

app.post("/farmer", async (req, res) => {
  try {
    let newFarmer = new model.Farmer({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
    });
    await newFarmer.setPassword(req.body.password);
    const errors = newFarmer.validateSync();
    if (errors) {
      return res.status(422).send(errors);
    }
    await newFarmer.save();
    //log the farmer in after signup
    req.session.farmerID = newFarmer._id;
    // req.session.username = newFarmer.username;
    // req.session.password = newFarmer.password;
    res.status(201).json({
      message: "Farmer created and logged in",
      farmer: {
        id: newFarmer._id,
        username: newFarmer.username,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("farmer signup failed");
  }
});

//login
app.get("/session", AuthMiddleware, (req, res) => {
  res.send(req.farmer);
});
app.post("/session", async function (req, res) {
  try {
    let farmer = await model.Farmer.findOne({ username: req.body.username });
    if (!farmer) {
      return res.status(404).send("No such farmer");
    }
    console.log(farmer);
    let isPasswordValid = await farmer.verifyPassword(req.body.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }
    req.session.farmerID = farmer._id;
    // req.session.username = farmer.username;
    // req.session.password = farmer.password;
    res.status(201).send("farmer logged in");
  } catch (error) {
    console.log(error);
    res.status(400).send("farmer login failed");
  }
});
//logout
app.delete("/session", function (req, res) {
  // req.session.farmerID = null;
  // res.status(204).send("farmer logged out");
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Logout failed");
    }

    // Clear the session cookie
    res.clearCookie("connect.sid"); // "connect.sid" is the default cookie name for express-session
    res.status(204).send("Farmer logged out");
  });
});
//getting all products
app.get("/products", async (req, res) => {
  try {
    let products = await model.Product.find().populate(
      "owner",
      " firstName lastName username email"
    );
    // if (!products) {
    //   return res.status(404).send("No products found");
    // }
    res.send(products);
  } catch (error) {
    res.status(404).send("No products found");
  }
});
// Fetch a single product with owner details
app.get("/products/:productid", async (req, res) => {
  try {
    let product = await model.Product.findById(req.params.productid).populate(
      "owner",
      "firstName lastName username email"
    );
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send(product);
  } catch (error) {
    res.status(404).send("Product not found");
  }
});
//creating products
app.post("/products", AuthMiddleware, async (req, res) => {
  try {
    let newProduct = new model.Product({
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      imageURL: req.body.imageURL,
      quantity: req.body.quantity,
      sellerName: req.body.sellerName,
      sellerPhone: req.body.sellerPhone,
      location: req.body.location,
      owner: req.session.farmerID,
    });
    const errors = newProduct.validateSync();
    if (errors) {
      return res.status(422).send(errors);
    }
    await newProduct.populate("owner", { username: 1, _id: 0 });
    await newProduct.save();
    res.status(201).send("Product created");
  } catch (error) {
    console.log(error);
    res.status(400).send("Product not created");
  }
});
//updating products
app.put("/products/:productid", AuthMiddleware, async (req, res) => {
  try {
    let product = await model.Product.findOne({
      _id: req.params.productid,
      owner: req.session.farmerID,
    }).populate("owner");
    if (!product) {
      return res.status(404).send("No such product");
    }
    // if (req.session.farmerID != product.owner._id) {
    //   return res.status(403).send("Not authorized to update this product");
    // }
    product.productName = req.body.productName;
    product.description = req.body.description;
    product.price = req.body.price;
    product.imageURL = req.body.imageURL;
    product.quantity = req.body.quantity;
    product.sellerName = req.body.sellerName;
    product.sellerPhone = req.body.sellerPhone;
    product.location = req.body.location;

    const errors = await product.validateSync();
    if (errors) {
      return res.status(422).send(errors);
    }
    await product.save();
    res.status(200).send("Product updated");
  } catch (error) {
    console.log(error);
    res.status(400).send("Product not updated");
  }
});
//deleting products
app.delete("/products/:productid", AuthMiddleware, async (req, res) => {
  try {
    let isDeleted = await model.Product.findOneAndDelete({
      _id: req.params.productid,
      owner: req.session.farmerID,
    });
    if (!isDeleted) {
      return res.status(404).send("No such product");
    }
    res.status(204).send("Product deleted");
  } catch (error) {
    res.status(400).send("Product not deleted");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
