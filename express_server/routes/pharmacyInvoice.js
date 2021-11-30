const express = require("express");
const router = express.Router();


const { PharmacyInvoice, validateInvoice } = require("../schemas/pharmacyInvoice");
const { Medicine } = require("../schemas/medicine");
const { Employee } = require("../schemas/employee");
const { requestLogger } = require("../logger");


/**
# GET all pharmacy invoices
**/
router.get("/", async (req, res) => {
  try {
    const invoices = await PharmacyInvoice.find();

    requestLogger(`[GET] ${req.baseUrl} - 200`);
    res.status(200).send(invoices);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error"}));
  }
});


/**
# CREATE New PharmacyInvoice
**/
router.post("/", async (req, res) => {
  try {

    const { error } = validateInvoice(req.body);

    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : error.details[0].message}));
    }

    let invoice = await PharmacyInvoice.findOne({"invoiceNumber" : req.body.invoiceNumber});
    if (invoice) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Duplicate Invoice Number"}));
    }

    // validate employee
    const emp = await Employee.findById(req.body.employeeID);
    if (!emp) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Employee Not Found!"}));
    }

    // console.log(req.body.cartItems, typeof(req.body.cartItems));

    if (req.body.cartItems.length < 1) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Cart cannot be empty!"}));
    }


    Promise.all(req.body.cartItems.map( async item => {
      const med = await Medicine.findOne({"productNumber" : item.productNumber});
      if (!med)
        throw new Error("Invalid Product ID. Not Found");
      return med;
    }))
      .then (async function () {
        invoice = new PharmacyInvoice({
          invoiceNumber: req.body.invoiceNumber,
          employeeID: req.body.employeeID,
          cashier: req.body.cashier,
          customerID: req.body.customerID,
          payableAmount: req.body.payableAmount,
          givenAmount: req.body.givenAmount,
          changeAmount: req.body.changeAmount,
          cartItems: req.body.cartItems
        });

        invoice = await invoice.save();

        requestLogger(`[POST] ${req.baseUrl} - 201`);
        return res.status(201).send(invoice);
      })
      .catch (error => {
        console.log(error);
        requestLogger(`[POST] ${req.baseUrl} - 400`);
        return res.status(400).send(JSON.stringify({"message2" : error.message }));
      });
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error"}));
  }
});



module.exports = router;
