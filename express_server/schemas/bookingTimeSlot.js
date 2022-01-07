/**
# Schemas for booking time slots
# Represents the each booking time slot for a day (eg. 9:00AM - 9:30AM)
# the purpose is for us to easily track the booking data and times
# 30-minutes interval
# Read only data, will not accept any non-GET requests from the other parties
# all the slots data will be added to db automatically at server app start-up
# i.e: whenever after the database has been Connected
# Upon addition, the 'saveBookingSlots' function checks whether the data are already saved
# if particular data is missing, the function will add that data to db, if not, do nothing
**/

const mongoose = require('mongoose');
const Joi = require('joi');



const schema = new mongoose.Schema({
  slot_id: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
});


const BookingTimeSlot = new mongoose.model('booking_time_slot', schema);

const timeSlots = [
  {
    slot_id: 1,
    startTime: '9:00 AM',
    endTime: '9:30 AM'
  },
  {
    slot_id: 2,
    startTime: '9:30 AM',
    endTime: '10:00 AM'
  },
  {
    slot_id: 3,
    startTime: '10:00 AM',
    endTime: '10:30 AM'
  },
  {
    slot_id: 4,
    startTime: '10:30 AM',
    endTime: '11:30 AM'
  },
  {
    slot_id: 5,
    startTime: '11:30 AM',
    endTime: '12:00 PM'
  },
  {
    slot_id: 6,
    startTime: '1:00 PM',
    endTime: '1:30 PM'
  },
  {
    slot_id: 7,
    startTime: '1:30 PM',
    endTime: '2:00 PM'
  },
  {
    slot_id: 8,
    startTime: '2:00 PM',
    endTime: '2:30 PM'
  },
  {
    slot_id: 9,
    startTime: '2:30 PM',
    endTime: '3:00 PM'
  },
  {
    slot_id: 10,
    startTime: '3:00 PM',
    endTime: '3:30 PM'
  },
  {
    slot_id: 11,
    startTime: '3:30 PM',
    endTime: '4:00 PM'
  },
  {
    slot_id: 12,
    startTime: '4:00 PM',
    endTime: '4:30 PM'
  },
  {
    slot_id: 13,
    startTime: '4:30 PM',
    endTime: '5:00 PM'
  },
  {
    slot_id: 14,
    startTime: '5:00 PM',
    endTime: '5:30 PM'
  },
];


exports.saveBookingSlots = function () {
  try {
    let bulkOps = [];

    timeSlots.forEach( timeSlot => {
      let upsertDocument = {
        'updateOne': {
          'filter' : { 'startTime' : timeSlot.startTime, 'endTime' : timeSlot.endTime },
          'update' : { $setOnInsert: timeSlot },
          'upsert' : true
        }
      }

      bulkOps.push(upsertDocument);
    });

    BookingTimeSlot.collection.bulkWrite(bulkOps)
      .then ( result => {
        console.log('Successfully saved BookingTimeSlots data.')
      })
      .catch ( error => {
        console.error('Bulk Write Error!', error);
      });
  }
  catch (error) {
    console.error(error);
  }
}

exports.BookingTimeSlot = BookingTimeSlot;
exports.BookingTimeSlotSchema = schema;
