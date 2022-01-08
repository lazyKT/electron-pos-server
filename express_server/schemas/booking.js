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
  doctorName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientContact: {
    type: String,
    required: true
  },
  remark: {
    type: String,
    default: ''
  },
  dateTime: {
    type: Date,
    expires: 0
  },
  timeSlot: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now,
  }
});

// create TTL index for Expiration
bookingSchema.index({dateTime: 1}, {expireAfterSeconds: 3600});


const Booking = new mongoose.model('Booking', bookingSchema);


function validateBookingEntry (booking) {

  const schema = Joi.object({
    receptionistId: Joi.string().required(),
    doctorId: Joi.string().required(),
    patientName: Joi.string().required(),
    patientContact: Joi.string().required(),
    remarks: Joi.string().allow(''),
    timeSlot: Joi.string().required(),
    dateTime: Joi.date()
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
  });

  return schema.validate(booking);
}

exports.Booking = Booking;
exports.validateBookingEntry = validateBookingEntry;
