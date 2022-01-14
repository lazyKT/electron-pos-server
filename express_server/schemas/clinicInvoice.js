/**
# Invoice Model/Schema for Clinic
**/

const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));


const serviceSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
    default: 'N/A'
  }
});


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



const clinicInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true
  },
  employeeID: {
    type: String,
    required: true
  },
  cashier: {
    type: String,
    required: true
  },
  doctorID: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientID: {
    type: String,
    required: true
  },
  services: [ serviceSchema ],
  items: [ cartItemSchema ],
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
  remark: {
    type: String,
    default: 'N/A'
  },
  created: {
    type: Date,
    default: new Date()
  }
});



function validateClinicInvoice (invoice) {
  const schema = Joi.object({
    invoiceNumber: Joi.string().min(17).max(17).required(),
    employeeID: Joi.string().required(),
    cashier: Joi.string().required(),
    doctorName: Joi.string().required(),
    doctorID: Joi.string().required(),
    patientName: Joi.string().required(),
    patientID: Joi.string().required(),
    payableAmount: Joi.number().min(0).required(),
    givenAmount: Joi.number().min(0).required(),
    changeAmount: Joi.number().min(0).required(),
    remark: Joi.string(),
    items: Joi.array().items({
      productNumber: Joi.string().required(),
      productName: Joi.string().required(),
      productId: Joi.string().required(),
      tagId: Joi.string().required(),
      price: Joi.number().required(),
      qty: Joi.number().required(),
      totalPrice: Joi.number().required()
    }),
    services: Joi.array().items({
      id: Joi.alternatives().try(Joi.number(), Joi.string()),
      description: Joi.string().required(),
      qty: Joi.number().min(1).required(),
      price: Joi.number().min(0).required(),
      totalPrice: Joi.number().min(0).required(),
      remarks: Joi.string().allow('').required()
    })
  });

  const validationResult = schema.validate(invoice);
  return validationResult;
}


const ClinicInvoice = new mongoose.model("ClinicInvoice", clinicInvoiceSchema);


exports.ClinicInvoice = ClinicInvoice;
exports.validateClinicInvoice = validateClinicInvoice;
