/**
 # Db Schema for Doctors
 **/

const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));


const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  workingDays: {
    type: [ Number ],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});


const Doctor = new mongoose.model("Doctor", doctorSchema);


function validateDoctorEntry (doctor) {
  const schema = Joi.object({
    name: Joi.string().required(),
    specialization: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    workingDays: Joi.array().items(
      Joi.number().required().min(0).max(6)
    ).required()
  });

  return schema.validate(doctor);
}

exports.Doctor = Doctor;
exports.validateDoctorEntry = validateDoctorEntry;
