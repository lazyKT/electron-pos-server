const mongoose = require('mongoose');
const Joi = require('joi')
              .extend(require('@joi/date'));



const specializationSchema = new mongoose.Schema({
  specialId: {
    type: String,
    required: true
  },
  name: {
    type: String,
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


const Specialization = new mongoose.model('Specialization', specializationSchema);


function validateSpecialEntry (specialization) {

  const schema = Joi.object({
    specialId: Joi.string().required(),
    name: Joi.string().required(),
    remarks: Joi.string().allow(null).allow('')
  });

  return schema.validate(specialization);
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


function generateSpecializationId () {
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


exports.Specialization = Specialization;
exports.validateSpecialEntry = validateSpecialEntry;
