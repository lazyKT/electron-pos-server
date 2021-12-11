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
  age: {
    type: Number,
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
    age: Joi.number().min(0).required(),
    mobile: Joi.string().min(8).max(16).required(),
    address: Joi.string().min(10).required(),
    remark: Joi.string().allow(null).allow(''),
    allergies: Joi.string().allow(null).allow('')
  });

  return schema.validate(patient);
}


/** add zero prefixs to the time values **/
function zeroPadding (value, type) {
  let strValue = value.toString();
  if (type === "ms") {
    while (strValue.length < 3)
      strValue = '0' + strValue;
  }
  else {
    while (strValue.length < 2)
      strValue = '0' + strValue;
  }
  return strValue;
}


function generatePatientId () {
  const date = new Date();
  const year = date.getFullYear();
  const month = zeroPadding(date.getMonth() + 1);
  const day = zeroPadding(date.getDate());
  const hr = zeroPadding(date.getHours());
  const mm = zeroPadding(date.getMinutes());
  const ss = zeroPadding(date.getSeconds());
  const ms = zeroPadding(date.getMilliseconds());
  return `pt_${year}${month}${day}${hr}${mm}${ss}${ms}`;
}


const Patient = new mongoose.model("Patient", patientSchema);


exports.Patient = Patient;
exports.validatePatientEntry = validatePatientEntry;
exports.generatePatientId = generatePatientId;
