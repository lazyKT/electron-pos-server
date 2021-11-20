const express = require("express");
const router = express.Router();


const { PharmacyInvoice, validateInvoice } = require("../schemas/invoice");
const { Medicine } = require("../schemas/medicine");
const { Employee } = require("../schemas/employee");


/**
# GET all pharmacy invoices
**/
router.get("/", async (req, res) => {
  try {
    const invoices = await PharmacyInvoice.find();

    res.status(200).send(invoices);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error"}));
  }
});


/**
# CREATE New PharmacyInvoice
**/
router.post("/", async (req, res) => {
  try {

    const { error } = validateInvoice(req.body);

    if (error)
      return res.status(400).send(JSON.stringify({"message" : error.details[0].message}));

    let invoice = await PharmacyInvoice.findOne({"invoiceNumber" : req.body.invoiceNumber});
    if (invoice)
      return res.status(400).send(JSON.stringify({"message" : "Duplicate Invoice Number"}));

    // validate employee
    const emp = await Employee.findById(req.body.employeeID);
    if (!emp)
      return res.status(400).send(JSON.stringify({"message" : "Employee Not Found!"}));

    // console.log(req.body.cartItems, typeof(req.body.cartItems));

    if (req.body.cartItems.length < 1)
      return res.status(400).send(JSON.stringify({"message" : "Cart cannot be empty!"}));


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
          customerID: req.body.customerID,
          payableAmount: req.body.payableAmount,
          givenAmount: req.body.givenAmount,
          changeAmount: req.body.changeAmount,
          cartItems: req.body.cartItems
        });

        invoice = await invoice.save();

        return res.status(201).send(invoice);
      })
      .catch (error => {

        return res.status(400).send(JSON.stringify({"message" : error.message }));
      });
  }
  catch (error) {
  
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error"}));
  }
});



module.exports = router;
