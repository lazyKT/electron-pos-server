/**
 # Db Schema for Doctors
 **/

const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));


const workingSchedule = {

}

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
  workingSchedule: [ workingSchedule ],
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
    workingSchedule: Joi.array().items({
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
      day: Joi.number().min(0).max(6).required(),
    })
  });

  return schema.validate(doctor);
}


function validateWorkingSchedule (schedule) {
  const schema = Joi.object({
    doctorId: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    day: Joi.number().min(0).max(6).required(),
  });

  return schema.validate(schedule);
}

exports.Doctor = Doctor;
exports.validateDoctorEntry = validateDoctorEntry;
exports.validateWorkingSchedule = validateWorkingSchedule;
