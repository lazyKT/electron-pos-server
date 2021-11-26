const mongoose = require('mongoose');

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
# Validate QueryString for Medicine Search at Checkout
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
