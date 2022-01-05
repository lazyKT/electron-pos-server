const mongoose = require('mongoose');

const { to24HourFormat } = require('./utils');

/**
# Validate Medicine Request Body at Checkout
# Request Body must include tagId, medId an qty properties
# tagId and medId must be the validate MongoDB ObjectID
# qty must a number and greater than zero.
**/
exports.validateMedCheckOut = function (requestBody) {

  if (!requestBody.tagId)
    return {error: true, message: "tagId property is required!"};

  if (!mongoose.Types.ObjectId.isValid(requestBody.tagId))
    return {error: true, message: 'Invalid ObjectId Received: tagId'}

  if (!requestBody.medId)
    return {error: true, message: "medId property is required!"};

  if (!mongoose.Types.ObjectId.isValid(requestBody.medId))
    return {error: true, message: 'Invalid ObjectId Received: medId'}

  if (!requestBody.qty)
    return {error: true, message: "qty property is required!"};

  if (typeof(requestBody.qty) !== 'number' || requestBody.qty < 0)
    return {error: true, message: 'Qty value must be number type and must be greater than zero.'}

  return {error: false}
}


/**
# Validate QueryString for Medicine Search at Pharmacy Cashier
# Query String must be included
# Qyery String must be a string type value
# Query must not be null, undefined or empty
# Query must not be include special characters (& ? = + -)
**/
exports.validateMedCheckOutSearchQueries = function (requestQuery) {

  if (!requestQuery.q)
    return {error: true, message: "Request Query 'q' is required at checkout search."};

  if (typeof(requestQuery.q) !== 'string' || requestQuery.q === null || requestQuery.q.length < 1)
    return {error: true, message: "Query String 'q' must be string and must not be null or empty."};

  if ((requestQuery.q).includes('&') || (requestQuery.q).includes('?')
          || (requestQuery.q).includes('='))
    return {error: true, message: "Malformed Query String. Invalid Search Params!"}

  return {error: false};
}



/**
 * Validate Clinic Invoice Request body
 * Validate ObjectId
 * Check Valid Fields
 **/
exports.validateEmployeeObjectIDClinicInvoice = function (employeeID) {
  if (!mongoose.Types.ObjectId.isValid(employeeID))
    return {error: true, message: 'Invalid ObjectId Received: medId'}
}


/**
 * Validate Service Items and Medicine Items at Clinic Cashier
 * Request body must contain both Service and medication items
 * At least 1 service/medicine items must be present in the request body
 **/
exports.validateServiceAndMedicinesItems = function (requestBody) {

  if (!requestBody.items)
    return { error: true, message: "Missing Required Field (items)" }

  if (!requestBody.services)
    return { error: true, message: "Missing Required Field (Services)" };

  if (requestBody.services && requestBody.services.length < 1)
    return { error: true, message: "Services Cannot be Empty!" }

  return { error: false };
}


/**
 * validate doctor's working schedule, endTime , startTime
 * new startTime must be grater/later than current schedule end time
 * new endtime must be earlier than current schedule start time
 **/
exports.validateScheduleTiming = function (schedules, requestBody) {

  let message = '';
  let error = false;

  const startHour = to24HourFormat(requestBody.startTime);
  const endHour = to24HourFormat(requestBody.endTime);

  schedules.some (sch => {

    const currentStartHour = to24HourFormat(sch.startTime);
    const currentEndHour = to24HourFormat(sch.endTime);


    if (parseInt(requestBody.day) !== sch.day) {
      error = false;
      message = '';
    }
    else if (startHour === currentStartHour) {
      error = true;
      message = `Invalid Start Time. Conflict with existing schedule time, ${sch.startTime}-${sch.endTime}`;
      return true;
    }
    else if (endHour === currentEndHour) {
      error = true;
      message = `Invalid End Time. Conflict with existing schedule time, ${sch.startTime}-${sch.endTime}`;
      return true;
    }
    else if (startHour < currentEndHour && startHour > currentStartHour) {
      error = true;
      message = `Invalid Start Time. Conflict with existing schedule time, ${sch.startTime}-${sch.endTime}`;
      return true;
    }
    else if (endHour > currentStartHour && endHour < currentEndHour) {
      error = true;
      message = `Invalid End Time. Conflict with existing schedule time, ${sch.startTime}-${sch.endTime}`;
      return true;
    }
    else {
      error = false;
      message = '';
    }
  });

  return { error, message };
}
