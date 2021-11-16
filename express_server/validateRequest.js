exports.validateMedCheckOut = function (requestBody) {

  if (!requestBody.tagId)
    return {error: true, message: "tagId property is required!"};

  if (!requestBody.medId)
    return {error: true, message: "medId property is required!"};

  if (!requestBody.qty)
    return {error: true, message: "qty property is required!"};

  return {error: false}
}


exports.validateMedCheckOutSearchQueries = function (requestQuery) {

  if (!requestQuery.q)
    return {error: true, message: "Request Query 'q' is required at checkout search."};

  return {error: false};
}
