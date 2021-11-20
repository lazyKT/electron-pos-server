/**
# Express Server
**/
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

const Config = require("./express_server/config");

let PORT

/**
# Connect to Mongo Db
**/
mongoose.connect(Config.dbURL)
  .then(() => {
    console.log("MongoDB Connected.");
    Config.dbstaus = "connected";
    process.send('{"name": "dbstatus", "status": "connected"}');
  })
  .catch(err => {
    Config.dbStatus = "error";
    console.error("Error Connecting MongoDB: \n", err);
    process.send(`{"name": "dbstatus", "status": "error"}`);
    // process.stderr.write(`{"status" : "error", "message": "${err}"}\n`);
  });


const home = require("./express_server/routes/home");
const inventory = require("./express_server/routes/inventory");
const medicine = require("./express_server/routes/medicine");
const tag = require("./express_server/routes/tag");
const employee = require("./express_server/routes/employee");
const invoice = require("./express_server/routes/invoice");


const app = express();

app.use(express.json());
app.use("/", home);
app.use("/api/inventory", inventory);
app.use("/api/meds", medicine);
app.use("/api/tags", tag);
app.use("/api/employees", employee);
app.use("/api/pharmacy/invoices", invoice);


process.on("message", m => {
  if (m === "PORT") {
    process.send(`server-port:${PORT}`);
  }
});


const server = app.listen(8080, () => {
  // PORT = server.address().port;
  PORT = 8080;
  console.log("Server is running at PORT:", PORT);
  process.send("server-ready");
  process.send(`server-port:${PORT}`);
});
