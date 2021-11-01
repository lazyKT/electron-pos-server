const express = require("express");
const router = express.Router();


const { Medicine } = require("../schemas/medicine");
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
      console.log('tag', req.query.tag);

      const tag = await findTag(req.query.tag);

      if (!tag) return res.status(404).send("Tag(s) not found!");

      const meds = await Medicine.find({'tag': tag.name});

      return res.send(meds);
    }

    const meds = await Medicine.find();

    res.send(meds);
  }
  catch (error) {
    res.status(500).send(`Error reteriving medicines: ${error}`);
  }
});



router.post('/', async (req, res) => {
  try {
    const tag = await findTag(req.body.tag);
    if (!tag)
      return res.status(404).send("Tag not found!");


    let newMeds = new Medicine({
      name: req.body.name,
      description: req.body.description,
      tag: tag.name,
      qty: req.body.qty,
      expiry: req.body.expiry
    });

    newMeds = await newMeds.save();

    res.send(newMeds);
  }
  catch (error) {
    res.status(500).send(`Error Creating New Meds: ${error}`);
  }
});



/** get meds by id */
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById (req.params.id);

    if (!med)
      return res.status(404).send('Med(s) Not Found!');

    res.send(med);
  }
  catch (error) {
    res.status(500).send(`Error Getting Meds By ID: ${error}`);
  }
});


/** get meds by tag name**/
router.get('/by-tag', async (req, res) => {
  try {
    console.log('tag', req.query.tag);
    const tag = await findTag(req.query.tag);

    if (!tag) res.status(404).send("Tag(s) not found!");

    const meds = await Medicine.find({'tag' : tag});

    return meds;
  }
  catch (error) {
    res.status(500).send(`Error: Reteriving Meds By Tags: ${error}`);
  }
});



module.exports = router;
