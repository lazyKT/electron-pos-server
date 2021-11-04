const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Config = require("../config");



router.get("/", (req, res) => {
  res.send("Home Page");
});


router.get("/test", (req, res) => {
  res.send("test");
});


router.get("/db-reset", (req, res) => {
  if (Config.dbstatus === "connected")
    return res.status(400).send("DB Already Connected");

  mongoose.connect(Config.dbURL)
    .then(() => {
      console.log("MongoDB Connected.");
      Config.dbstaus = "connected";
      process.send('{"name": "dbstatus", "status": "connected"}');

      res.status(200).send("Connection Success");
    })
    .catch(err => {
      Config.dbStatus = "error";
      console.error("Error Connecting MongoDB: \n", err);
      process.send(`{"name": "dbstatus", "status": "error"}`);

      res.status(500).send("Cannot connect to database");
    });
});


module.exports = router;
