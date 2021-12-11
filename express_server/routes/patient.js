/**
 * Patient End Points
 */

const express = require('express');
const router = express.Router();

const {
  Patient,
  validatePatientEntry,
  generatePatientId
} = require('../schemas/patient');
const { requestLogger } = require('../logger');
const validateObjectId = require('../middlewares/validateObjectId');

// get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();

    requestLogger(`[GET] ${req.baseUrl} - 200`);
    res.status(200).send(patients);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// create new patient
router.post('/', async (req, res) => {
  try {

    const requestBody = {
      ...req.body,
      patientId: generatePatientId()
    };

    const { error } = validatePatientEntry(requestBody);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

    let patient = new Patient({
      patientId: requestBody.patientId,
      fullname: requestBody.fullname,
      mobile: requestBody.mobile,
      address: requestBody.address,
      gender: requestBody.gender,
      age: requestBody.age,
      allergies: requestBody.allergies,
      remark: requestBody.allergies
    });

    patient = await patient.save();

    requestLogger(`[POST] ${req.baseUrl} - 201`);
    res.status(201).send(patient);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get patient details by id
router.get ('/:id', validateObjectId, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stirngify({'message' : 'Patient Not Found!'}))
    }

    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 200`);
    res.status(200).send(patient);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stirngify({'message' : 'Internal Server Error!'}));
  }
});


// edit patient details by id
router.put('/:id', validateObjectId, async (req, res) => {
  try {

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new : true }
    );

    if (!patient) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Patient Update Failed!'}));
    }

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 201`);
    res.status(201).send(patient);
  }
  catch (error) {
    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stirngify({'message' : 'Internal Server Error!'}));
  }
});


// delete patient by id
router.delete('/:id', validateObjectId, async (req, id) => {
  try {
    const patient = await Patient.findByIdAndRemove(req.params.id);

    if (!patient) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Patient Deletion Failed!'}));
    }

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 204`);
    return res.status(204).send('');
  }
  catch (error) {
    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stirngify({'message' : 'Internal Server Error!'}));
  }
});


module.exports = router;
