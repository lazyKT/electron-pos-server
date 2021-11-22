const mongoose = require("mongoose");
const Joi = require("joi")
              .extend (require("@joi/date"));


const medicineSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 64
  },
  productNumber: {
    type: String,
    required: true
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
  price: {
    type: Number,
    required: true
  },
  approve: {
    type: Boolean,
    default: true
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


function validateMeds (med) {
  const schema = Joi.object({
    name: Joi.string().required(),
    expiry: Joi.date()
      .format ("YYYY-MM-DD")
      .raw()
      .required()
      .messages({
        'date.base': `"expiry" should be a type of 'text'`,
        'date.empty': `"expiry" cannot be an empty field`,
        'date.min': `"expiry" should have a minimum length of {#limit}`,
        'date.required': `"expiry" is a required field`,
        'date.format.iso': `"expiry" date format wrong.`,
        'date.format.javascript': `'expiry' date fromat wrong javascript`,
        'date.format.unix': `'expiry' date format wrong unix`
      }),
    productNumber: Joi.string().required(),
    tag: Joi.string().required(),
    price: Joi.number().required(),
    approve: Joi.boolean().required(),
    description: Joi.string(),
    qty: Joi.number().integer().min(0).required()
  });

  const validateResult = schema.validate(med);
  return validateResult;
}


const Medicine = new mongoose.model ("Medicine", medicineSchema);


exports.Medicine = Medicine;
exports.validateMeds = validateMeds;
