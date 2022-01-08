/**
 # API Endpoints for doctors
 **/

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lodash = require('lodash');

const {
  Doctor,
  validateDoctorEntry,
  validateWorkingSchedule,
  validateCheckScheduleRequest
} = require('../schemas/doctor.js');
const { requestLogger } = require('../logger');
const { validateScheduleTiming } = require('../validateRequest');
const { isValidTime, generateId, to24HourFormat } = require('../utils');
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

    req.body.workingSchedule.forEach( ws => {
      if (!(isValidTime(ws.startTime))) {
        requestLogger(`[POST] ${req.baseUrl} - 400`);
        return res.status(200).send(JSON.stringify({'message' : 'Field, startTime, is not a valid date-time value' }));
      }

      if (!(isValidTime(ws.endTime))) {
        requestLogger(`[POST] ${req.baseUrl} - 400`);
        return res.status(200).send(JSON.stringify({'message' : 'Field, endTime, is not a valid date-time value' }));
      }
    });

    let doctor = new Doctor({
      doctorId: generateId('doc'),
      name: req.body.name,
      specialization: req.body.specialization,
      workingSchedule: req.body.workingSchedule
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


// add working schedule
router.put ('/add-schedule', async (req, res) => {
  try {
    const { error } = validateWorkingSchedule (req.body);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl}/add-schedule - 400`);
      return res.status(200).send(JSON.stringify({'message' : error.details[0].message }));
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.doctorId)) {
      requestLogger (`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid Doctor Id!'}));
    }

    let doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      requestLogger (`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Doctor Not Found!'}));
    }

    if (!(isValidTime(req.body.startTime))) {
      requestLogger(`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Field, startTime, is not a valid date-time value' }));
    }

    if (!(isValidTime(req.body.endTime))) {
      requestLogger(`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Field, endTime, is not a valid date-time value' }));
    }

    const { error: timingError, message } = validateScheduleTiming(doctor.workingSchedule, req.body);
    if (timingError) {
      requestLogger(`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : message }));
    }

    const workingSchedule = [
      ...doctor.workingSchedule,
      {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        day: req.body.day
      }
    ];

    doctor = await Doctor.findByIdAndUpdate(
      req.body.doctorId,
      { workingSchedule, updatedAt: Date.now() },
      { new : true }
    );

    requestLogger(`[PUT] ${req.baseUrl}/add-schedule - 201`);
    return res.status(201).send(doctor);
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[PUT] ${req.baseUrl}/add-schedule - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// remove working schedule
router.put ('/remove-schedule', async (req, res) => {
  try {
    const { error } = validateWorkingSchedule (req.body);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl}/add-schedule - 400`);
      return res.status(200).send(JSON.stringify({'message' : error.details[0].message }));
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.doctorId)) {
      requestLogger (`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid Doctor Id!'}));
    }

    let doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      requestLogger (`[PUT] ${req.baseUrl}/add-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Doctor Not Found!'}));
    }

    const scheduleToRemove = {
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      day: req.body.day
    }

    const workingSchedule = doctor.workingSchedule.filter(ws => !(Lodash.isEqual(ws, scheduleToRemove)));

    doctor = await Doctor.findByIdAndUpdate(
      req.body.doctorId,
      { workingSchedule, updatedAt : Date.now() },
      { new : true }
    );

    requestLogger(`[PUT] ${req.baseUrl}/remove-schedule - 201`);
    return res.status(201).send(doctor);
  }
  catch (error) {
    console.error(error.message);
    requestLogger(`[PUT] ${req.baseUrl}/remove-schedule - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// check whether the given datetime is fall inside doctor schedule
router.get('/check-schedule', async (req, res) => {
  try {

    const requestQueries = {
      doctorId: req.query.doctor,
      time: req.query.time,
      day: req.query.day
    }

    const { error } = validateCheckScheduleRequest(requestQueries);

    if (error) {
      requestLogger(`[GET] ${req.baseUrl}/check-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

    if (!mongoose.Types.ObjectId.isValid(requestQueries.doctorId)) {
      requestLogger(`[GET] ${req.baseUrl}/check-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid Doctor ID!'}));
    }

    const doctor = await Doctor.findById(requestQueries.doctorId);
    if (!doctor) {
      requestLogger(`[GET] ${req.baseUrl}/check-schedule - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Doctor Not Found!'}));
    }

    const workingSchedule = doctor.workingSchedule;
    const bookingTime = parseInt((requestQueries.time).split(':')[0]);
    let isRegular = false;

    workingSchedule.some( ws => {

      const startHour = to24HourFormat(ws.startTime);
      const endHour = to24HourFormat(ws.endTime);

      if (ws.day === parseInt(requestQueries.day) && bookingTime >= startHour && bookingTime <= endHour) {
        isRegular = true;
        return true;
      }
    });

    return res.status(200).send(JSON.stringify({'doctor' : doctor.name,'isRegular' : isRegular}));
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl}/check-schedule - 500`);
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
