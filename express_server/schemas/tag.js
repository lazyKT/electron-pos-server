const mongoose = require("mongoose");


const tagSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 64
  },
  lowQtyAlert: {
    type: Number,
    required: true
  },
  expiryDateAlert: {
    type: Number,
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


const Tag = new mongoose.model ("Tag", tagSchema);


exports.Tag = Tag;
