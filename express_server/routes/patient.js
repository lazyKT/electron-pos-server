/**
 * Patient End Points
 */

const express = require('express');
const router = express.Router();

const {
  Patient,
  validatePatientEntry,
  validatePatientUpdate,
  generatePatientId
} = require('../schemas/patient');
const { requestLogger } = require('../logger');
const validateObjectId = require('../middlewares/validateObjectId');

// get all patients
router.get('/', async (req, res) => {
  try {

    let page = 0;
    let limit = 10;
    let sort = 'fullname';
    let order = 1;
    let sortObj = {};

    if (req.query.page && parseInt(req.query.page) > 0)
      page = parseInt(req.query.page) - 1;

    if (req.query.limit)
      limit = parseInt(req.query.limit)

    if (req.query.sort && req.query.sort !== '')
      sort = req.query.sort;

    if (req.query.order && (req.query.order === '-1' || req.query.order === '1'))
      order = parseInt(req.query.order);

    sortObj[sort] = order;

    const patients = await Patient.find(
      {},
      null,
      {
        skip: page * limit,
        limit
      }
    ).sort(sortObj);

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
      birthday: requestBody.birthday,
      allergies: requestBody.allergies,
      remark: requestBody.allergies
    });

    patient = await patient.save();

    requestLogger(`[POST] ${req.baseUrl} - 201`);
    res.status(201).send(patient);
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// search patients by name
router.get ('/search', async (req, res) => {
  try {
    let patients;
    if (!req.query.q || req.query.q === '') {
      patients = [];
    }
    else {
      patients = await Patient.find({
        'fullname': { $regex: req.query.q, $options: 'i'}
      });
    }

    requestLogger(`[GET] ${req.baseUrl}/search - 200`);
    res.status(200).send(patients);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get patient details by id
router.get ('/:id', validateObjectId, async (req, res) => {
  try {
    console.log(req.params.id);
    const patient = await Patient.findById(req.params.id);
    console.log(patient);
    if (!patient) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({'message' : 'Patient Not Found!'}))
    }

    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 200`);
    res.status(200).send(patient);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
    return res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// edit patient details by id
router.put('/:id', validateObjectId, async (req, res) => {
  try {

    const { error } = validatePatientUpdate(req.body);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

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
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// delete patient by id
router.delete('/:id', validateObjectId, async (req, res) => {
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
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


module.exports = router;
