/**
 # API Endpoints for doctors
 **/

const express = require('express');
const router = express.Router();

const { Doctor, validateDoctorEntry } = require('../schemas/doctor.js');
const { requestLogger } = require('../logger');
const { isValidTime, generateId } = require('../utils');
const validateObjectId = require('../middlewares/validateObjectId');



// get all dcotors
router.get ('/', async (req, res) => {
  try {

    let limit = 10;
    let page = 0;
    let sort = 'name';
    let order = -1;
    let sortObj = {};

    if (req.query.page && parseInt(req.query.page) > 0)
      page = parseInt(req.query.page) - 1;

    if (req.query.limit && parseInt(req.query.limit) > 0)
      limit = parseInt (req.query.limit);

    if (req.query.sort && req.query.sort !== '')
      sort = req.query.sort;

    if (req.query.order && (req.query.order === '-1' || req.query.order === '1'))
      order = parseInt(req.query.order);

    sortObj[sort] = order;

    const doctors = await Doctor.find(
      {},
      null,
      {
        skip: limit * page,
        limit
      }
    ).sort(sortObj);

    requestLogger(`[GET] ${req.baseUrl} - 200`);
    res.status(200).send(doctors);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// create new doctor
router.post ('/', async (req, res) => {
  try {
    const { error } = validateDoctorEntry (req.body);

    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(200).send(JSON.stringify({'message' : error.details[0].message }));
    }

    if (!(isValidTime(req.body.startTime))) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(200).send(JSON.stringify({'message' : 'Field, startTime, is not a valid date-time value' }));
    }

    if (!(isValidTime(req.body.endTime))) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(200).send(JSON.stringify({'message' : 'Field, endTime, is not a valid date-time value' }));
    }

    let doctor = new Doctor({
      doctorId: generateId('doc'),
      name: req.body.name,
      specialization: req.body.specialization,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      workingDays: req.body.workingDays
    });

    doctor = await doctor.save();

    requestLogger(`[POST] ${req.baseUrl} - 201`)
    return res.status(201).send(doctor);
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get doctor count
router.get ('/count', async (req, res) => {
  try {
    const count = await Doctor.count();

    requestLogger(`[GET] ${req.baseUrl}/count - 200`);
    res.status(200).send(JSON.stringify({'count' : count }));
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[GET] ${req.baseUrl}/count - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// search doctor by name
router.get ('/search', async (req, res) => {
  try {

    let doctors = [];

    if (req.query.q && req.query.q !== '') {
      doctors = await Doctor.find(
        { 'name' : { $regex : req.query.q, $options: 'i' }}
      );
    }

    requestLogger(`[GET] ${req.baseUrl}/search - 200`);
    res.status(200).send(doctors);
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[GET] ${req.baseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get doctor by id
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({'message' : 'Doctor Not Found!'}));
    }

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 200`);
    return res.status(200).send(doctor);
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[GET] ${req.baseUrl}/${req.parmas.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// update doctor by id
router.put ('/:id', validateObjectId, async (req, res) => {
  try {
    const update = Object.assign(req.body, { updated : new Date() });
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      update,
      { new : true }
    );

    if (!doctor) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Doctor Upate Failed!'}));
    }

    requestLogger(`[PUT] ${req.baseUrl} - 201`)
    return res.status(201).send(doctor);
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[PUT] ${req.baseUrl}/${req.parmas.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// delete doctor by id
router.delete ('/:id', validateObjectId, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndRemove(req.params.id);

    if (!doctor) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Doctor Deletion Failed!'}));
    }

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 204`);
    return res.status(204).send('');
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[DELETE] ${req.baseUrl}/${req.parmas.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


module.exports = router;
