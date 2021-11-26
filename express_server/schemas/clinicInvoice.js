/**
# Invoice Model/Schema for Clinic
**/

const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));


const invoiceItemSchema = new mongoose.Schema({
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
  note: {
    type: String,
    default: 'N/A'
  }
});



const clinicInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  doctorId: {
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
  patientId: {
    type: String,
    required: true
  },
  invoiceItems: [invoiceItemSchema],
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
    employeeId: Joi.string().required(),
    employeeName: Joi.string().required(),
    doctorName: Joi.string().required(),
    doctorId: Joi.string().required(),
    patientName: Joi.string().required(),
    patientId: Joi.string().required(),
    payableAmount: Joi.number().min(0).required(),
    givenAmount: Joi.number().min(0).required(),
    changeAmount: Joi.number().min(0).required(),
    remark: Joi.string(),
    invoiceItems: Joi.array().items({
      description: Joi.string().min(4).required(),
      qty: Joi.number().min(1).required(),
      price: Joi.number().min(0).required(),
      totalPrice: Joi.number().min(0).required(),
      note: Joi.string()
    });
  });

  const validationResult = schema.validate(invoice);
  return validationResult;
}


const ClinicInvoice = new mongoose.model("ClinicInvoice", clinicInvoiceSchema);


exports.ClinicInvoice = ClinicInvoice;
exports.validateClinicInvoice = validateClinicInvoice;
