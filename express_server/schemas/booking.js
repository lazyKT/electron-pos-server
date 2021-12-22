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
  dateTime: {
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
    dateTime: Joi.date()
                .format('YYYY-MM-DD')
                .raw()
                .greater('now')
                .required()
                .messages({
                  'date.base': `"expiry" should be a type of 'text'`,
                  'date.empty': `"expiry" cannot be an empty field`,
                  'date.min': `"expiry" should have a minimum length of {#limit}`,
                  'date.required': `"expiry" is a required field`,
                  'date.format.iso': `"expiry" date format wrong.`,
                  'date.format.javascript': `'expiry' date fromat wrong javascript`,
                  'date.format.unix': `'expiry' date format wrong unix`
                })
  });

  return schema.validate(booking);
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


function generateBookingId () {
  const date = new Date();
  const year = date.getFullYear();
  const month = zeroPadding(date.getMonth() + 1);
  const day = zeroPadding(date.getDate());
  const hr = zeroPadding(date.getHours());
  const mm = zeroPadding(date.getMinutes());
  const ss = zeroPadding(date.getSeconds());
  const ms = zeroPadding(date.getMilliseconds());
  return `b_${year}${month}${day}${hr}${mm}${ss}${ms}`;
}


exports.Booking = Booking;
exports.validateBookingEntry = validateBookingEntry;
exports.generateBookingId = generateBookingId;
