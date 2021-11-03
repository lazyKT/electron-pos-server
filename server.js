/**
# Express Server
**/
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

let PORT

/**
# Connect to Mongo Db
**/
const dbURL = "mongodb://localhost/pharmacy";
mongoose.connect(dbURL)
  .then(() => {
    console.log("MongoDB Connected.");
    process.send('{"name": "dbstatus", "status": "connected"}');
  })
  .catch(err => {
    console.error("Error Connecting MongoDB: \n", err);
    process.send('{"name": "dbstatus", "status": "error"}');
    process.stderr.write(`${err}\n`);
  });


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


process.on("message", m => {
  if (m === "PORT") {
    process.send(`server-port:${PORT}`);
  }
});


const server = app.listen(0, () => {
  console.log("Server is running at PORT:", server.address().port);
  PORT = server.address().port;
  process.send("server-ready");
});
