exports.validateMedCheckOut = function (requestBody) {

  if (!requestBody.tagId)
    return {error: true, message: "tagId property is required!"};

  if (!requestBody.medId)
    return {error: true, message: "medId property is required!"};

  if (!requestBody.qty)
    return {error: true, message: "qty property is required!"};

  return {error: false}
}
