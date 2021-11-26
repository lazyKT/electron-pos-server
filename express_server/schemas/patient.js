/**
# Patient Schema/Model
**/

const mongoose = require("mongoose");
const Joi = require("joi")
              .extend(require("@joi/date"))



const patientSchema = new mongoose.schema({
  patientId: {
    type: String,
    minLength: 10,
    required: true
  },
  name: {
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
  address: {
    type: String,
    minLength: 10,
    required: true
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
    name: Joi.string().min(4).max(50).required(),
    mobile: Joi.string().min(8).max(16).required(),
    address: Joi.string().min(10).required(),
    remark: Joi.string()
  });
}


const Patient = new mongoose.model("Patient", patientSchema);


exports.Patient = Patient;
exports.validatePatientEntry = validatePatientEntry;
