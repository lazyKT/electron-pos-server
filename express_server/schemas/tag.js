const mongoose = require("mongoose");
const Joi = require("joi")
              .extend (require("@joi/date"));


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
  location: {
    type: String,
    default: "tbh"
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


function validateTag (tag) {
  const schema = Joi.object({
    name: Joi.string().required(),
    lowQtyAlert: Joi.number().integer().min(5).required(),
    expiryDateAlert: Joi.number().integer().min(30).required(),
    location: Joi.string()
  });

  const validationResult = schema.validate(tag);

  return validationResult;
}


const Tag = new mongoose.model ("Tag", tagSchema);


exports.Tag = Tag;
exports.validateTag = validateTag;
