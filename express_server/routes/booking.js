const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Booking, validateBookingEntry, generateBookingId } = require('../schemas/booking');
const { requestLogger } = require('../logger');
const validateObjectId = require('../middlewares/validateObjectId');


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

    const bookingId = generateBookingId();
    const requestBody = {
      ...(req.body),
      bookingId
    }
    const { error } = validateBookingEntry(req.body);

    if (error) {
      requestLogger(`[POST] ${baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

    if (!mongoose.Types.ObjectId.isValid(requestBody.receptionistId)) {
      requestLogger(`[POST] ${baseUrl}/ - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Invalid receptionistId'}));
    }

    let booking = new Booking({
      bookingId: bookingId,
      receptionistId: req.body.receptionistId,
      receptionistName: req.body.receptionistName,
      serviceName: req.body.serviceName,
      serviceId: req.body.serviceId,
      assignedStaffName: req.body.assignedStaffName,
      patientName: req.body.patientName,
      patientId: req.body.patientId,
      dateTime: req.body.dateTime,
      status: req.body.status,
      remarks: req.body.remarks
    });

    booking = await booking.save();

    return res.status(201).send(booking);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});



module.exports = router;
