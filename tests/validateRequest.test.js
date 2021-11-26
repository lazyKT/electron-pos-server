/**
# Unit Tests For ValidateRequest Functions
**/

const validateRequest = require("../express_server/validateRequest.js");


describe('Validate Medicine Checkout Request Body at Checkout', () => {

  it ("Request Body Without tagId", () => {
    const body = {
      "medId" : "61920ce97b0b5044c4347cdc",
      "qty" : 4
    };
    const result = validateRequest.validateMedCheckOut(body);
    expect(result.error).toEqual(true);
  });

  it ("Request Body With Malformed/Invalid tagId", () => {
    const body = {
      "tagId" : "12341234",
      "medId" : "61920ce97b0b5044c4347cdc",
      "qty" : 4
    };
    const result = validateRequest.validateMedCheckOut(body);

    expect(result.error).toEqual(true);
  });


  it ("Request Body Without medId", () => {
    const body = {
      "tagId" : "61920ce97b0b5044c4347cdc",
      "qty" : 4
    };
    const result = validateRequest.validateMedCheckOut(body);

    expect(result.error).toEqual(true);
  });

  it ("Request Body With Malformed/Invalid medId", () => {
    const body = {
      "tagId" : "61920ce97b0b5044c4347cdc",
      "medId" : "abcd123",
      "qty" : 5
    };
    const result = validateRequest.validateMedCheckOut(body);
    expect(result.error).toEqual(true);
  });


  it ("Request Body Without qty", () => {
    const body = {
      "tagId" : "5c0a7922c9d89830f4911426",
      "medId" : "5c0a7922c9d89830f4911426",
    };
    const result = validateRequest.validateMedCheckOut(body);
    expect(result.error).toEqual(true);
  });

  it ("Request Body With Malformed/Invalid qty value", () => {
    const body = {
      "tagId" : "5c0a7922c9d89830f4911426",
      "medId" : "5c0a7922c9d89830f4911426",
      "qty" : "10"
    };
    const result = validateRequest.validateMedCheckOut(body);
    expect(result.error).toEqual(true);
  });


  it ("Valid Request Body", () => {
    const body = {
      "tagId" : "5c0a7922c9d89830f4911426",
      "medId" : "5c0a7922c9d89830f4911426",
      "qty" : 10
    };
    const result = validateRequest.validateMedCheckOut(body);
    expect(result.error).toEqual(false);
  });
});
