/**
 * API Endpoints for Clinic Cashier
 **/

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { ClinicInvoice, validateClinicInvoice } = require('../schemas/clinicInvoice');
const { Employee } = require('../schemas/employee');
const { Medicine } = require('../schemas/medicine');
const { Doctor } = require('../schemas/doctor');
const { Service } = require('../schemas/service');
const { validateServiceAndMedicinesItems } = require('../validateRequest');
const { requestLogger } = require('../logger');



// get all clinic invoices
router.get('/', async (req, res) => {

	const invoices = await ClinicInvoice.find();

	requestLogger(`[GET] ${req.baseUrl} - 200`);
	res.status(200).send(invoices);
});



// create new clinic invoices
router.post('/', async (req, res) => {
	try {
		// validate service and medicines items in the request body
		const validateCartItems = validateServiceAndMedicinesItems (req.body);
		if (validateCartItems.error) {
			requestLogger(`[POST] ${req.baseUrl} - 400`);
			return res.status(400).send(JSON.stringify({"message" : validateCartItems.message}));
		}

		// validate other fields in the request body
		const { error } = validateClinicInvoice(req.body);
		if (error) {
			requestLogger(`[POST] ${req.baseUrl} - 400`);
			return res.status(400).send(JSON.stringify({"message" : error.details[0].message}));
		}

    if (!mongoose.Types.ObjectId.isValid(req.body.employeeID)) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : 'Invalid ObjectId Received: employeeID'}));
    }

		// validate employee in the request body
		const emp = await Employee.findById(req.body.employeeID);
		if (!emp) {
			requestLogger(`[POST] ${req.baseUrl} - 400`);
			return res.status(400).send(JSON.stringify({"message" : "Employee Not Found!"}));
		}

		// validate doctor in the request body
		if (!mongoose.Types.ObjectId.isValid(req.body.doctorID)) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : 'Invalid ObjectId Received: doctorID'}));
    }

		const doctor = await Doctor.findById(req.body.doctorID);
		if (!doctor) {
			requestLogger(`[POST] ${req.baseUrl} - 400`);
			return res.status(400).send(JSON.stringify({"message" : "Doctor Not Found!"}));
		}

		// service validation
		let validateServiceError = false;
		req.body.services.some(async s => {
			if (s.remarks !== 'Others') {
				const service = await Service.findById(s.id);
				if (!service) {
					validateServiceError = true;
					return true;
				}
			}
		});

		if (validateServiceError) {
			requestLogger(`[POST] ${req.baseUrl} - 400`);
			return res.status(400).send(JSON.stringify({"message" : "Invalid Service Found in Request Body!"}));
		}


		let invoice = await ClinicInvoice.findOne({"invoiceNumber" : req.body.invoiceNumber});
		if (invoice) {
			requestLogger(`[POST] ${req.baseUrl} - 400`);
      console.log("Error, duplicate invoice numbers!");
			return res.status(400).send(JSON.stringify({"message" : "Error, duplicate invoice numbers!"}));
		}


		// validate medcines in the medication item list
		Promise.all (req.body.items.map( async item => {
			const med = await Medicine.findOne({"productNumber" : item.productNumber});
			if (!med) throw new Error(`Invalid Product Number, ${item.productNumber} Not Found`);
			return med;
		}))
		.then (async () => {
			// create new clinic invoice
			invoice = new ClinicInvoice({
				invoiceNumber: req.body.invoiceNumber,
				employeeID: req.body.employeeID,
				cashier: req.body.cashier,
				doctorID: req.body.doctorID,
				doctorName: req.body.doctorName,
				patientID: req.body.patientID,
				patientName: req.body.patientName,
				payableAmount: req.body.payableAmount,
				givenAmount: req.body.givenAmount,
				changeAmount: req.body.changeAmount,
				items: req.body.items,
				services: req.body.services
			});

			invoice = await invoice.save();

			requestLogger(`[POST] ${req.baseUrl} - 201`);

			return res.status(201).send(invoice);
		})
		.catch ( error => {
      console.error('Thrown From Promise All');
			console.error(error);
			requestLogger(`[POST] ${req.baseUrl} - 400`);
			return res.status(400).send(JSON.stringify({"message" : error.message}));
		});
	}
	catch (error) {
    console.log('error', error);
		requestLogger(`[POST] ${req.baseUrl} - 500`);
		res.status(500).send(JSON.stringify({"message" : "Internal Server Error"}));
	}
});



module.exports = router;
