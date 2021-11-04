const express = require("express");
const router = express.Router();


const { Medicine, validateMeds } = require("../schemas/medicine");
const { Tag } = require("../schemas/tag");



const findTag = async name => {
  try {
    const tag = await Tag.findOne({'name' : name});

    return tag;
  }
  catch (error) {
    console.log("Error Finding Tag by name", error);
  }
}


router.get('/', async (req, res) => {
  try {
    if(req.query.tag) {

      const tag = await findTag(req.query.tag);

      if (!tag) return res.status(404).send(JSON.stringify({"message" : "Category not found"}));

      const meds = await Medicine.find({'tag': tag.name});

      return res.send(meds);
    }

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

    const filter = { productNumber: req.body.productNumber, expiry: new Date(req.body.expiry).toISOString()};
    const update = {
      qty: req.body.qty,
      tag: req.body.tag,
      name: req.body.name,
      productNumber: req.body.productNumber,
      description: req.body.description,
      price: req.body.price,
      approve: req.body.approve,
    };

    const med = await Medicine.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        upsert: true
      }
    );

    res.status(201).send(med);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Adding Medicine: ${error}`}));
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
    const tag = await findTag(req.query.tag);

    if (!tag) res.status(404).send(JSON.stringify({"message" : "Category not found"}));

    const meds = await Medicine.find({'tag' : tag});

    return meds;
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine by tag: ${error}`}));
  }
});


/** search meds by keyword **/
router.get('/search', async (req, res) => {
  try {
    console.log("Searching Meds")
    // search in name
    let meds = await Medicine.find(
      {"name" : { $regex: req.query.q, $options: "i"}}
    );

    // search in description
    meds.push(await Medicine.find(
      {"description" : { $regex: req.query.q, $options: "i"}}
    ));

    res.status(200).send(meds);
  }
  catch (error) {
    console.log(`Error Searching Mes : ${error}`);
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

    res.send(med);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Getting Medicine by Id: ${error}`}));
  }
});


/** edit medicine */
router.put('/:id', async (req, res) => {
  try {
    const tag = await findTag(req.body.tag);

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
    console.log("Searching Meds")
    const deletedMed = await Medicine.findByIdAndRemove(req.params.id);

    if (!deletedMed)
      return rs.status(404).send(JSON.stringify({"message" : "Med not found"}));

    res.send(deletedMed);
  }
  catch (error) {
    process.stderr.write('{"status" : "error", "message" : "error deleting medicine"}');
    res.status(500).send(JSON.stringify({"message" : `Error Deletion Medicine: ${error}`}));
  }
});


module.exports = router;
