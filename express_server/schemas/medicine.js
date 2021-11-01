const mongoose = require("mongoose");


const medicineSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 64
  },
  description: String,
  tag: [String],
  qty: {
    type: Number,
    required: true
  },
  expiry: {
    type: Date,
    required: true
  },
  created: {
    type: Date,
    default: new Date()
  },
  updated: {
    type: Date,
    default: new Date()
  }
});


const Medicine = new mongoose.model ("Medicine", medicineSchema);


exports.Medicine = Medicine;
