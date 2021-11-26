const mongoose = require("mongoose");
const Joi = require("joi")
              .extend(require("@joi/date"));


const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productNumber: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  tagId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  remark: {
    type: String
  }
});


const pharmacyInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    min: 14,
    required: true,
    index: { unique: true }
  },
  employeeID: {
    type: String,
    required: true
  },
  cashier: {
    type: String,
    required: true
  },
  customerID: {
    type: String,
    required: true
  },
  cartItems: [ cartItemSchema ],
  payableAmount: {
    type: Number,
    required: true
  },
  givenAmount: {
    type: Number,
    required: true
  },
  changeAmount: {
    type: Number,
    required: true
  },
  created: {
    type: Date,
    default: new Date()
  }
});


function validateInvoice (invoice) {
  const schema = Joi.object({
    invoiceNumber: Joi.string().min(14).required(),
    employeeID: Joi.string().required(),
    cashier: Joi.string().required(),
    customerID: Joi.string().required(),
    payableAmount: Joi.number().required(),
    cartItems: Joi.array().items({
        productNumber: Joi.string().required(),
        productName: Joi.string().required(),
        productId: Joi.string().required(),
        tagId: Joi.string().required(),
        price: Joi.number().required(),
        qty: Joi.number().required(),
        totalPrice: Joi.number().required()
    }),
    givenAmount: Joi.number().required(),
    changeAmount: Joi.number().required()
  });

  const validateResult = schema.validate(invoice);
  return validateResult;
}



const PharmacyInvoice = new mongoose.model ("PharmacyInvoice", pharmacyInvoiceSchema);


exports.PharmacyInvoice = PharmacyInvoice;
exports.validateInvoice = validateInvoice;
