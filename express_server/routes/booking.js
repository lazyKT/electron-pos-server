const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Service } = require('../schemas/service');
const { Employee } = require('../schemas/employee');
const { Booking, validateBookingEntry } = require('../schemas/booking');
const { BookingTimeSlot } = require('../schemas/bookingTimeSlot');
const { requestLogger } = require('../logger');
const validateObjectId = require('../middlewares/validateObjectId');
const { generateId, asyncFilter } = require('../utils');


// get all bookings
router.get('/', async (req, res) => {

  try {
    let limit = 10;
    let page = 0;
    let order = 1;
    let sort = 'dateTime';
    let sortObj = {};

    if (req.query.limit && parseInt(req.query.limit) > 0)
      limit = parseInt(req.query.limit);

    if (req.query.page && parseInt(req.query.page) > 0)
      page = parseInt(req.query.page) - 1;

    if (req.query.order && (req.query.order === '-1' || req.query.order === '1'))
      order = parseInt(req.query.order);

    if (req.query.sort && req.query.sort !== '')
      sort = req.query.sort;

    sortObj[sort] = order;

    const bookings = await Booking.find(
      {},
      null,
      {
        skip: page * limit,
        limit
      }
    ).sort(sortObj);

    requestLogger(`[GET] ${req.baseUrl} - 200`);
    res.status(200).send(bookings);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// create new booking
router.post('/', async (req, res) => {
  try {

    const bookingId = generateId('b');
    const requestBody = {
      ...(req.body),
      bookingId
    };

    const { error } = validateBookingEntry(requestBody);

    if (error) {
      requestLogger(`[POST] ${req.baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

    if (!mongoose.Types.ObjectId.isValid(requestBody.receptionistId)) {
      requestLogger(`[POST] ${req.baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid receptionistId'}));
    }

    const employee = await Employee.findById(requestBody.receptionistId);
    if (!employee) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Employee Not Found!'}));
    }

    if (!mongoose.Types.ObjectId.isValid(requestBody.serviceId)) {
      requestLogger(`[POST] ${req.baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid serviceId'}));
    }

    const service = await Service.findById(requestBody.serviceId);
    if (!service) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Service Not Found!'}));
    }

    if (!mongoose.Types.ObjectId.isValid(requestBody.timeSlot)) {
      requestLogger(`[POST] ${req.baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid timeSlotId'}));
    }

    const timeSlot = await BookingTimeSlot.findById(requestBody.timeSlot);
    if (!timeSlot) {
      requestLogger(`[POST] ${req.baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'TimeSlot Not Found!'}));
    }


    let booking = new Booking({
      bookingId: bookingId,
      receptionistId: req.body.receptionistId,
      receptionistName: req.body.receptionistName,
      serviceName: service.name,
      serviceId: req.body.serviceId,
      assignedStaffName: req.body.assignedStaffName,
      patientName: req.body.patientName,
      patientId: req.body.patientId ? req.body.patientId : 'N.A',
      patientContact: req.body.patientContact,
      bookingDate: req.body.bookingDate,
      timeSlot: req.body.timeSlot,
      bookingTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
      status: req.body.status,
      remarks: req.body.remarks,
    });

    booking = await booking.save();

    return res.status(201).send(booking);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// search booking by patient name (or) servie name
router.get('/search', async (req, res) => {
  try {
    let filters = [];
    let bookings = [];

    if (req.query.service && req.query.servie !== '')
      filters.push({'serviceName' :  { $regex: req.query.service, $options: 'i'} });

    if (req.query.patient && req.query.patient !== '')
      filters.push({'patientName' : { $regex: req.query.patient, $options: 'i'} });

    if (filters.length !== 0) {
      bookings = await Booking.find({
        $and : [ ...filters ]
      });
    }

    requestLogger(`[GET] ${req.baseUrl}/search - 200`);
    res.status(200).send(bookings);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get total number of bookings
router.get('/count', async (req, res) => {
  try {
    const count = await Booking.count();

    requestLogger(`[GET] ${req.baseUrl}/count - 200`);
    res.status(200).send(JSON.stringify({'count' : count}));
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl}/count - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get bookings by date
router.get('/available-slots', async (req, res) => {
  try {
    if (!req.query.date || req.query.date === '') {
      requestLogger(`[GET] ${req.baseUrl}/available-slots - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Empty Date!'}));
    }

    let date1 = new Date(req.query.date);

    if (!(date1 instanceof Date)) {
      requestLogger(`[GET] ${req.baseUrl}/available-slots - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid Date!'}));
    }

    let date2 = new Date(req.query.date);
    date1.setDate(date1.getDate() + 1);



    BookingTimeSlot.find().lean()
      .then( async function (slots) {
        if (!slots)
          throw new Error('Error Fetching Time Slots');

        const availableSlots = await asyncFilter(slots, async (slot) => {

          const booking = await Booking.findOne({
            'bookingDate' : {
              $gte: date2,
              $lt: date1
            },
            'timeSlot' : slot._id
          });

          return booking === null;
        });

        requestLogger(`[GET] ${req.baseUrl}/available-slots - 200`);
        return res.status(200).send(availableSlots);
      });
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl}/by-date - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get all booking time slots
router.get('/all-slots', async (req, res) => {
  try {
    const slots = await BookingTimeSlot.find();

    res.status(200).send(slots);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/all-slots - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get available timeslots for the given date
router.get('/by-date', async (req, res) => {
  try {
    if (!req.query.date || req.query.date === '') {
      requestLogger(`[GET] ${req.baseUrl}/available-slots - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Empty Date!'}));
    }

    let date1 = new Date(req.query.date);

    if (!(date1 instanceof Date)) {
      requestLogger(`[GET] ${req.baseUrl}/available-slots - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid Date!'}));
    }

    let date2 = new Date(req.query.date);
    date1.setDate(date1.getDate() + 1);
    // console.log(date1, date2);
    const bookings = await Booking.find({
      'bookingDate' : {
        $gte: date2,
        $lt: date1
      }
    });

    requestLogger(`[GET] ${req.baseUrl}/by-date - 200`);
    res.status(200).send(bookings);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl}/available-slots - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get booking by id
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({'message' : 'Booking Not Found!'}));
    }

    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 200`);
    return res.status(200).send(booking);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// edit/update booking by id
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated: new Date()},
      { new: true}
    );

    if (!booking) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Booking Update Failed'}));
    }

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 201`);
    return res.status(201).send(booking);
  }
  catch (error) {
    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// delete booking by id
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndRemove(req.params.id);

    if (!booking) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Deletion Failed'}));
    }

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 201`);
    return res.status(201).send('');
  }
  catch (error) {
    console.error(error);
    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});



module.exports = router;
