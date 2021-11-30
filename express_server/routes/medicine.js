const express = require("express");
const router = express.Router();

const Lodash = require("lodash");


const { Medicine, validateMeds } = require("../schemas/medicine");
const { Tag } = require("../schemas/tag");
const { requestLogger } = require("../logger");


const {
  validateMedCheckOut,
  validateMedCheckOutSearchQueries
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

      if (!tag) {
        requestLogger(`[GET] ${req.baseUrl} - 404`);
        return res.status(404).send(JSON.stringify({"message" : "Category not found"}));
      }

      const meds = await Medicine.find(
        {'tag': tag.name},
        null,
        {
          skip: page * limit,
          limit
        }
      ).sort(sortObj);

      requestLogger(`[GET] ${req.baseUrl} - 200`);
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

    requestLogger(`[GET] ${req.baseUrl} - 200`);
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
    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : `${error.details[0].message}`}));
    }

    const tag = await findTag(req.body.tag);
    if (!tag) {
      requestLogger(`[POST] ${req.baseUrl} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Category not found"}));
    }


    const med = await Medicine.findOne({
      "productNumber" : (req.body.productNumber).toLowerCase()
    });

    if (med) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify(
        {"message" : `Medicine already exists with product number: ${req.body.productNumber}`}
      ));
    }

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

    requestLogger(`[POST] ${req.baseUrl} - 201`);
    res.status(201).send(newMed);
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Adding Medicine: ${error}`}));
  }
});


/**
# Search Medicine by Product Number
**/
router.get("/exact-search", async (req, res) => {
  try {
    if (!(req.query.productNumber)) {
      requestLogger(`[GET] ${req.baseUrl}/exact-search - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Bad Request"}));
    }

    const med = await Medicine.findOne({"productNumber": req.query.productNumber});

    if (!med) {
      requestLogger(`[GET] ${req.baseUrl}/exact-search - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Medicine Not Found"}));
    }

    requestLogger(`[GET] ${req.baseUrl}/exact-search - 200`);
    res.status(200).send(med);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/exact-search - 500`);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error!"}));
  }
});


/**
# get medicine by product number at checkout cashier
**/
router.get("/checkout", async (req, res) => {
  try {

    const { error, message } = validateMedCheckOutSearchQueries(req.query);

    if (error) {
      requestLogger(`[GET] ${req.baseUrl}/checkout - 400`);
      return res.status(400).send(JSON.stringify({"message" : message}));
    }

    Medicine.find({
      $or: [
        {"name" : {$regex: req.query.q, $options: "i"}},
        {"productNumber" : {$regex: req.query.q, $options: "i"}},
        {"description" : {$regex: req.query.q, $options: "i"}}
      ]
    }).lean()
      .then(function (meds) {
        if (!meds)
          throw new Error ("Error Searching Medicines");

        Promise.all(meds.map( async med => {
          const tag = await Tag.findById(med.tag);
          med.category = tag.name;
          med.location = tag.location;
          return med;
        }))
          .then(function (meds) {
            requestLogger(`[GET] ${req.baseUrl}/checkout - 200`);
            return res.status(200).send(meds);
          });
      });
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/checkout - 500`);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error!"}));
  }
});



/**
# Reduct quantity after checkout
**/
router.put("/checkout", async (req, res) => {
  try {
    const { error , message } = validateMedCheckOut(req.body);

    if (error) {
      requestLogger(`[PUT] ${req.baseUrl}/checkout - 400`);
      return res.status(400).send(JSON.stringify({"message" : message}));
    }

    const { tagId, medId, qty } = req.body;

    const med = await Medicine.findById(medId);
    if (!med) {
      requestLogger(`[PUT] ${req.baseUrl}/checkout - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Medicine Not Found!"}));
    }

    if (parseInt(med.qty) < parseInt(qty)) {
      requestLogger(`[PUT] ${req.baseUrl}/checkout - 400`);
      return res.status(400).send(JSON.stringify({"message" : `${med.name} : not enough remainning item(s)!`}));
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      requestLogger(`[PUT] ${req.baseUrl}/checkout - 200`);
      return res.status(400).send(JSON.stringify({"message" : "Category Not Found!"}));
    }

    const update = {"qty" : parseInt(med.qty) - parseInt(qty)};

    let updatedMedicine = await Medicine.findByIdAndUpdate(
      medId,
      update,
      { new : true }
    );  

    requestLogger(`[PUT] ${req.baseUrl}/checkout - 201`);
    res.status(201).send(updatedMedicine);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[PUT] ${req.baseUrl}/checkout - 500`);
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
      meds = Medicine.find({
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
      meds = Medicine.find({
        $and : [
          {"name" : { $regex : qName, $options: "i" }},
          {"tag" : { $regex : qTag, $options: "i" }},
          {"description" : { $regex : qName, $options: "i" }}
        ]
      });
    }

    meds.lean()
      .then(function (meds) {
        if(!meds)
          throw new Error("Error Searching Meds");

        Promise.all(meds.map( async med => {
          const tag = await Tag.findById(med.tag);
          med.category = tag.name;
          med.location = tag.location;
          return med;
        }))
          .then(function (meds) {
            requestLogger(`[GET] ${req.baseUrl}/export - 200`);
            return res.status(200).send(meds);
          })
      });
  }
  catch (error) {
    console.log(error);
    requestLogger(`[GET] ${req.baseUrl}/export - 500`);
    res.status(500).send(JSON.stringify({"message" : error.toString()}));
  }
});


/** total num of medicines **/
router.get('/count', async (req, res) => {
  try {
    const medCounts = await Medicine.count();

    requestLogger(`[GET] ${req.baseUrl}/count - 200`);
    res.status(200).send(JSON.stringify({"count" : medCounts}));
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/count - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine Counts: ${error}`}));
  }
});


/** get meds by tag name**/
router.get('/by-tag', async (req, res) => {
  try {
    const tag = await findTagById(req.query.tag);
    let searchQuery = ""

    if (!tag) {
      requestLogger(`[GET] ${req.baseUrl} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Category not found"}));
    }

    if (req.query.q)
      searchQuery = req.query.q;

    Medicine.find({
      "tag" : {$regex: tag._id, $options: "i"},
      $or: searchQuery === "" ? [
          {"name" : {$regex: searchQuery, $options: "i"}}
        ] :
        [
          {"productNumber" : {$regex: searchQuery, $options: "i"}},
          {"name" : {$regex: searchQuery, $options: "i"}},
          {"description" : {$regex: searchQuery, $options: "i"}}
        ]
    }).lean() // to convert the mongoose object to plain js object, and allow mutation
      .then (function (meds) {
        if (!meds)
          throw new Error("Error Searching Meds by Category!");

        Promise.all(meds.map(async med => {
          const tag = await Tag.findById(med.tag);
          med.category = tag.name;
          med.location = tag.location;
          return med;
        }))
          .then (meds => {
            console.log(req.baseUrl, "200");
            requestLogger(`[GET] ${req.baseUrl}/by-tag - 200`);
            return res.status(200).send(meds);
          });
      });
  }
  catch (error) {
    console.error(error);
    requestLogger(`[GET] ${req.baseUrl}/by-tag - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine by tag: ${error}`}));
  }
});


/** search meds by keyword **/
router.get('/search', async (req, res) => {
  try {
    let meds;
    let searchArea = "name";
    let filter = []

    if (req.query.area)
      searchArea = req.query.area;

    if (searchArea === "name")
      filter.push({"name" : { $regex: req.query.q, $options: "i"}});
    else if (searchArea === "description")
      filter.push({"description" : { $regex: req.query.q, $options: "i"}});
    else if (searchArea === "productNumber")
      filter.push({"productNumber" : { $regex: req.query.q, $options: "i"}});
    else {
      requestLogger(`[GET] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({
        "message" : `Invalid Search Field ${req.query.area}`
      }));
    }

    Medicine.find({
      $and: [...filter]
    }).lean() // lean() is to convert mongoose objects to plain javascript objects, the motive is to allow mutation
      .then (function (meds) {
        if (!meds)
          throw new Error("Meds Not Found!");

        // here I used promise.all to resolve the async call for every elements inside meds array
        Promise.all(meds.map(async med => {
          const tag = await Tag.findById(med.tag);
          med.category = tag.name;
          med.location = tag.location;
          return med;
        }))
          .then(meds => {
            requestLogger(`[GET] ${req.baseUrl}/search - 200`);
            return res.status(200).send(meds);
          });
      });
  }
  catch (error) {
    console.log(`Error Searching Mes : ${error}`);
    requestLogger(`[GET] ${req.baseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Searching Medicine: ${error}`}));
  }
});


/** get meds by id */
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById (req.params.id).lean();
    // console.log('expiry', med)
    if (!med) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Med(s) not found"}));
    }


    const tag = await findTagById(med.tag);

    if (!tag) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "Invalid Category!"}));
    }

    const data = Object.assign(med, {category: tag.name, location: tag.location});

    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 200`);
    res.send(data);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine by Id: ${error}`}));
  }
});


/** edit medicine */
router.put('/:id', async (req, res) => {
  try {
    const tag = await findTagById(req.body.tag);

    if (!tag) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Category not found"}));
    }

    // const filter = { id: req.params.id };
    const update = Object.assign(req.body, { updated : new Date() });
    let updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).lean();

    if (!updatedMedicine) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Med not found"}));
    }


    updatedMedicine = Object.assign(updatedMedicine, {category: tag.name, location: tag.location})

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 201`);
    res.status(201).send(updatedMedicine);
  }
  catch (error) {
    console.error(error);
    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Editting Medicine: ${error}`}));
  }
});


/** delete medicine **/
router.delete('/:id', async (req, res) => {
  try {
    // console.log("Searching Meds")
    const deletedMed = await Medicine.findByIdAndRemove(req.params.id);

    if (!deletedMed) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 404`);
      return rs.status(404).send(JSON.stringify({"message" : "Med not found"}));
    }

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 200`);
    res.send(deletedMed);
  }
  catch (error) {
    // process.stderr.write('{"status" : "error", "message" : "error deleting medicine"}');
    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Deletion Medicine: ${error}`}));
  }
});


module.exports = router;
