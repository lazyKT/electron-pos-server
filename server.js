/**
# Express Server
**/
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

const Config = require("./express_server/config");

let PORT

/**
 * Connect to Mongo Db
 * Run Test Server -> $ NODE_ENV=test node server.js
 **/
const dbUrl = process.env.NODE_ENV === 'test' ? Config.testDB : Config.dbURL;
mongoose.connect(dbUrl)
  .then(() => {
    console.log(`Connected to ${dbUrl}`);
    Config.dbstaus = "connected";
    process.env.NODE_ENV !== 'test' && process.send('{"name": "dbstatus", "status": "connected"}');
  })
  .catch(err => {
    Config.dbStatus = "error";
    console.error("Error Connecting MongoDB: \n", err);
    process.send(`{"name": "dbstatus", "status": "error"}`);
    // process.stderr.write(`{"status" : "error", "message": "${err}"}\n`);
  });


const home = require("./express_server/routes/home");
const medicine = require("./express_server/routes/medicine");
const tag = require("./express_server/routes/tag");
const employee = require("./express_server/routes/employee");
const patient = require("./express_server/routes/patient");
const pharmacyInvoice = require("./express_server/routes/pharmacyInvoice");
const clinicInvoice = require("./express_server/routes/clinicInvoice");


const app = express();

app.use(express.json());
app.use("/", home);
app.use("/api/meds", medicine);
app.use("/api/tags", tag);
app.use("/api/employees", employee);
app.use("/api/patients", patient);
app.use("/api/pharmacy/invoices", pharmacyInvoice);
app.use("/api/clinic/invoices", clinicInvoice);


process.on("message", m => {
  if (m === "PORT") {
    process.send(`server-port:${PORT}`);
  }
});


const server = app.listen(8080, () => {
  // PORT = server.address().port;
  PORT = 8080;
  console.log("Server is running at PORT:", PORT);

  if (process.env.NODE_ENV !== 'test') {
    process.send("server-ready");
    process.send(`server-port:${PORT}`);
  }
  else {
    console.log ('Running Server in Test Environment...')
  }
});


// for integration testing
module.exports = server;
