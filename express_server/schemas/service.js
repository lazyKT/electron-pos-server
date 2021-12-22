const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));



const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  remarks: {
    type: String,
    default: 'N.A'
  },
  updated: {
    type: Date,
    default: new Date()
  },
  created: {
    type: Date,
    default: new Date()
  }
});


const Service = new mongoose.model('service', serviceSchema);


function validateServiceEntry (service) {

  const schema = Joi.object({
    serviceId: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    remarks: Joi.string().allow(null).allow('')
  });

  return schema.validate(service);
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


function generateServiceId () {
  const date = new Date();
  const year = date.getFullYear();
  const month = zeroPadding(date.getMonth() + 1);
  const day = zeroPadding(date.getDate());
  const hr = zeroPadding(date.getHours());
  const mm = zeroPadding(date.getMinutes());
  const ss = zeroPadding(date.getSeconds());
  const ms = zeroPadding(date.getMilliseconds());
  return `sv_${year}${month}${day}${hr}${mm}${ss}${ms}`;
}


exports.Service = Service;
exports.validateServiceEntry = validateServiceEntry;
