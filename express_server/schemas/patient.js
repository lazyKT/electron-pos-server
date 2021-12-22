/**
# Patient Schema/Model
**/

const mongoose = require("mongoose");
const Joi = require("joi")
              .extend(require("@joi/date"))



const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    minLength: 10,
    required: true
  },
  fullname: {
    type: String,
    minLength: 4,
    maxLength: 50,
    required: true
  },
  mobile: {
    type: String,
    minLength: 8,
    maxLength: 16,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    minLength: 1,
    maxLength: 6,
    required: true
  },
  address: {
    type: String,
    minLength: 10,
    required: true
  },
  allergies: {
    type: String,
    default: 'N/A'
  },
  remark: {
    type: String,
    default: 'N/A'
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


function validatePatientEntry (patient) {
  const schema = Joi.object({
    patientId: Joi.string().min(10).required(),
    fullname: Joi.string().min(4).max(50).required(),
    gender: Joi.string().min(1).max(6).required(),
    birthday: Joi.date()
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
    mobile: Joi.string().min(8).max(16).required(),
    address: Joi.string().min(10).required(),
    remark: Joi.string().allow(null).allow(''),
    allergies: Joi.string().allow(null).allow('')
  });

  return schema.validate(patient);
}


function validatePatientUpdate (patient) {
  const schema = Joi.object({
    fullname: Joi.string().min(10).required(),
    mobile: Joi.string().min(8).max(16).required(),
    address: Joi.string().min(10).required(),
    remark: Joi.string().allow(null).allow(''),
    allergies: Joi.string().allow(null).allow('')
  });

  return schema.validate(patient);
}


const Patient = new mongoose.model("Patient", patientSchema);


exports.Patient = Patient;
exports.validatePatientEntry = validatePatientEntry;
exports.validatePatientUpdate = validatePatientUpdate;
