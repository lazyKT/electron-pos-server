/**
# Doctor Model/Schema
**/

const mongoose = require("mongoose");
const Joi = require("joi")
              .extend(require("@joi/date"));



const doctorSchema = new mongoose.schema({
  doctorId: {
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
  title: {
    type: String,
    minLength: 4,
    required: true
  },
  mobile: {
    type: String,
    minLength: 8,
    maxLength: 8,
    required: true
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


function validateDoctorEntry (doc) {
  const schema = Joi.object({
    doctorId: Joi.string().min(10).required(),
    name: Joi.string().min(4).max(50).required(),
    title: Joi.string().min(4).required(),
    mobile: Joi.string().min(8).max(16).required(),
    address: Joi.string().min(10).required(),
    remark: Joi.string()
  });

  const result = schema.validate(doc);
  return result;
}


const Doctor = new mongoose.model("Doctor", doctorSchema);


exports.Doctor = Doctor;
exports.validateDoctorEntry = validateDoctorEntry;
