/**
 # Database Schema for Bookings
 **/

const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));


const bookingSchema = new mongoose.Schema({
  bookingId : {
    type: String,
    required: true
  },
  receptionistName: {
    type: String,
    required: true
  },
  receptionistId: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceId: {
    type: String,
    required: true
  },
  assignedStaffName: {
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
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'inactive'
  },
  remarks: {
    type: String,
    default: 'N.A'
  },
  created: {
    type: Date,
    default: new Date(),
  },
  updated: {
    type: Date,
    default: new Date()
  }
});


const Booking = new mongoose.model('Booking', bookingSchema);


function validateBookingEntry (booking) {

  const schema = Joi.object({
    bookingId: Joi.string().required(),
    receptionistName: Joi.string().required(),
    receptionistId: Joi.string().required(),
    serviceName: Joi.string().required(),
    serviceId: Joi.string().required(),
    assignedStaffName: Joi.string().required(),
    patientName: Joi.string().required(),
    patientId: Joi.string().required(),
    status: Joi.string().required(),
    remarks: Joi.string().allow(''),
    bookingDate: Joi.date()
                .format('YYYY-MM-DD')
                .raw()
                .greater('now')
                .required()
                .messages({
                  'date.base': `"dateTime" should be a type of 'text'`,
                  'date.empty': `"dateTime" cannot be an empty field`,
                  'date.min': `"dateTime" should have a minimum length of {#limit}`,
                  'date.required': `"dateTime" is a required field`,
                  'date.format.iso': `"dateTime" date format wrong.`,
                  'date.format.javascript': `'dateTime' date format wrong javascript`,
                  'date.format.unix': `'dateTime' date format wrong unix`
                }),
    bookingTime: Joi.date().timestamp().required()
  });

  return schema.validate(booking);
}


exports.Booking = Booking;
exports.validateBookingEntry = validateBookingEntry;
