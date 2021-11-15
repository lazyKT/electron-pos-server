const express = require("express");
const router = express.Router();

const Lodash = require("lodash");


const { Medicine, validateMeds } = require("../schemas/medicine");
const { Tag } = require("../schemas/tag");


const {
  validateMedCheckOut
} = require("../validateRequest.js");



const findTag = async name => {
  try {
    const tag = await Tag.findOne({
      'name' : { $regex: name, $options: "i"}
    });

    return tag;
  }
  catch (error) {
    console.log("Error Finding Tag by name", error);
  }
}


const findTagById = async id => {
  try {
    const tag = await Tag.findById(id);

    return tag;
  }
  catch (error) {
    console.error ("Error Finding Tag by Id", error);
  }
}


router.get('/', async (req, res) => {
  try {

    let page = 0;
    let limit = 10;
    let sort = "name"
    let order = 1;
    let sortObj = {};

    if (req.query.page)
      page = parseInt(req.query.page) - 1;

    if (req.query.limit)
      limit = parseInt(req.query.limit);

    if (req.query.order)
      order = parseInt(req.query.order);

    if (req.query.sort)
      sort = req.query.sort;

    sortObj[sort] = order;

    if(req.query.tag) {

      const tag = await findTag(req.query.tag);

      if (!tag) return res.status(404).send(JSON.stringify({"message" : "Category not found"}));

      const meds = await Medicine.find(
        {'tag': tag.name},
        null,
        {
          skip: page * limit,
          limit
        }
      ).sort(sortObj);

      return res.send(meds);
    }

    const meds = await Medicine.find(
      {},
      null,
      {
        skip: page * limit,
        limit
      }
    ).sort(sortObj);

    res.send(meds);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine: ${error}`}));
  }
});


/** add new meds, or update if existed */
router.post('/', async (req, res) => {
  try {

    const { error } = validateMeds(req.body);
    if (error)
      return res.status(400).send(JSON.stringify({"message" : `${error.details[0].message}`}));

    const tag = await findTag(req.body.tag);
    if (!tag)
      return res.status(404).send(JSON.stringify({"message" : "Category not found"}));


    const med = await Medicine.findOne({
      "productNumber" : (req.body.productNumber).toLowerCase()
    });

    if (med)
      return res.status(400).send(JSON.stringify(
        {"message" : `Medicine already exists with product number: ${req.body.productNumber}`}
      ));

    console.log("tag id", tag._id)

    let newMed = new Medicine({
      qty: req.body.qty,
      tag: tag._id,
      name: req.body.name,
      productNumber: (req.body.productNumber).toLowerCase(),
      description: req.body.description,
      price: req.body.price,
      approve: req.body.approve,
      expiry: new Date(req.body.expiry)
    });

    newMed = await newMed.save();

    res.status(201).send(newMed);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Adding Medicine: ${error}`}));
  }
});


/**
# Search Medicine by Product Number
**/
router.get("/exact-search", async (req, res) => {
  try {
    if (!(req.query.productNumber))
      return res.status(400).send(JSON.stringify({"message" : "Bad Request"}));

    const med = await Medicine.findOne({"productNumber": req.query.productNumber});

    if (!med)
      return res.status(404).send(JSON.stringify({"messge" : "Medicine Not Found"}));

    res.status(200).send(med);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error!"}));
  }
});



/**
# Reduct quantity after checkout
**/
router.put("/checkout", async (req, res) => {
  try {

    const { error , message } = validateMedCheckOut(req.body);

    if (error)
      return res.status(400).send(JSON.stringify({"message" : message}));

    const { tagId, medId, qty } = req.body;

    const med = await Medicine.findById(medId);
    if (!med)
      return res.status(400).send(JSON.stringify({"message" : "Medicine Not Found!"}));

    if (parseInt(med.qty) < parseInt(qty))
      return res.status(400).send(JSON.stringify({"message" : "Not enough item(s) remainning!"}));

    const tag = await Tag.findById(tagId);
    if (!tag)
      return res.status(400).send(JSON.stringify({"message" : "Category Not Found!"}));

    const update = {"qty" : parseInt(med.qty) - parseInt(qty)};

    let updatedMedicine = await Medicine.findByIdAndUpdate(
      medId,
      update,
      { new : true }
    );

    res.status(201).send(updatedMedicine);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error!"}));
  }
});



/**
# Export Med Data by date and name
**/
router.get("/export", async (req, res) => {
  try {

    let qTag = "";
    let qName = "";
    let meds;

    if (req.query.tag)
      qTag = req.query.tag;

    if (req.query.name)
      qName = req.query.name

    if (req.query.d1 && req.query.d2) {
      meds = await Medicine.find({
        "created" : {
          $gte: new Date(req.query.d1),
          $lt: new Date(req.query.d2)
        },
        $and : [
          {"name" : {
            $regex: qName,
            $options: "i"
          }},
          {"tag" : {
            $regex: qTag,
            $options: "i"
          }},
          {"description" : {
            $regex: qName,
            $options: "i"
          }}
        ]
      });
    }
    else {
      meds = await Medicine.find({
        $and : [
          {"name" : { $regex : qName, $options: "i" }},
          {"tag" : { $regex : qTag, $options: "i" }},
          {"description" : { $regex : qName, $options: "i" }}
        ]
      });
    }

    res.status(200).send(meds);
  }
  catch (error) {
    console.log(error);
    res.status(500).send(JSON.stringify({"message" : "Error exporting medicines. 500"}));
  }
});


/** total num of medicines **/
router.get('/count', async (req, res) => {
  try {
    const medCounts = await Medicine.count();

    res.status(200).send(JSON.stringify({"count" : medCounts}));
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine Counts: ${error}`}));
  }
});


/** get meds by tag name**/
router.get('/by-tag', async (req, res) => {
  try {
    const tag = await findTagById(req.query.tag);

    if (!tag)
      return res.status(404).send(JSON.stringify({"message" : "Category not found"}));

    const meds = await Medicine.find(
      {"tag" : {$regex: tag._id, $options: "i"}}
    );

    res.status(200).send(meds);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine by tag: ${error}`}));
  }
});


/** search meds by keyword **/
router.get('/search', async (req, res) => {
  try {
    let meds;
    let searchArea = "name";

    if (req.query.area)
      searchArea = req.query.area;

    if (searchArea === "name")
      meds = await Medicine.find(
        {"name" : { $regex: req.query.q, $options: "i"}}
      );
    else if (searchArea === "tag")
      meds = await Medicine.find(
        {"tag" : { $regex: req.query.q, $options: "i"}}
      );
    else if (searchArea === "description")
      meds = await Medicine.find(
        {"description" : { $regex: req.query.q, $options: "i"}}
      );
    else if (searchArea === "productNumber")
      meds = await Medicine.find(
        {"productNumber" : { $regex: req.query.q, $options: "i"}}
      );
    else
      return res.status(400).send(JSON.stringify({
        "message" : `Invalid Search Field ${req.query.area}`
      }));

    res.status(200).send(meds);
  }
  catch (error) {
    // console.log(`Error Searching Mes : ${error}`);
    res.status(500).send(JSON.stringify({"message" : `Error Searching Medicine: ${error}`}));
  }
});



/** get meds by id */
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById (req.params.id);
    // console.log('expiry', med)
    if (!med)
      return res.status(404).send(JSON.stringify({"message" : "Med(s) not found"}));


    const tag = await findTagById(med.tag);

    if (!tag)
      return res.status(400).send(JSON.stringify({"message" : "Invalid Category!"}));

    const data = Object.assign(med, {category: tag.name})

    res.send(data);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine by Id: ${error}`}));
  }
});


/** edit medicine */
router.put('/:id', async (req, res) => {
  try {
    const tag = await findTagById(req.body.tag);

    if (!tag)
      return res.status(404).send(JSON.stringify({"message" : "Category not found"}));

    // const filter = { id: req.params.id };
    const update = Object.assign(req.body, { updated : new Date() });
    let updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!updatedMedicine)
      return res.status(404).send(JSON.stringify({"message" : "Med not found"}));

    res.status(200).send(updatedMedicine);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(JSON.stringify({"message" : `Error Editting Medicine: ${error}`}));
  }
});


/** delete medicine **/
router.delete('/:id', async (req, res) => {
  try {
    // console.log("Searching Meds")
    const deletedMed = await Medicine.findByIdAndRemove(req.params.id);

    if (!deletedMed)
      return rs.status(404).send(JSON.stringify({"message" : "Med not found"}));

    res.send(deletedMed);
  }
  catch (error) {
    // process.stderr.write('{"status" : "error", "message" : "error deleting medicine"}');
    res.status(500).send(JSON.stringify({"message" : `Error Deletion Medicine: ${error}`}));
  }
});


module.exports = router;
