/**
# Express Server
**/
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");


/**
# Connect to Mongo Db
**/
const dbURL = "mongodb://localhost/pharmacy";
mongoose.connect(dbURL)
  .then(() => console.log("MongoDB Connected."))
  .catch(err => console.error("Error Connecting MongoDB: \n", err));


const home = require("./express_server/routes/home");
const inventory = require("./express_server/routes/inventory");
const medicine = require("./express_server/routes/medicine");
const tag = require("./express_server/routes/tag");


const app = express();

app.use(express.json());
app.use("/", home);
app.use("/api/inventory", inventory);
app.use("/api/meds", medicine);
app.use("/api/tags", tag);


app.listen(8080, () => console.log("Server is running at PORT: 8080"));
