const express = require("express");
const router = express.Router();


const { Tag, validateTag } = require("../schemas/tag");
const { Medicine } = require("../schemas/medicine");


/** get all tags */
router.get("/", async (req, res) => {

  let page = 0;
  let limit = 10;
  let sort = "name";
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

  const tags = await Tag.find(
    null,
    null,
    { skip: page * limit, limit}
  ).sort(sortObj);

  res.send(tags);
});



/** create new tag **/
router.post("/", async (req, res) => {
  try {

    const { error } = validateTag(req.body);
    if (error)
      return res.status(400).send(JSON.stringify({"message" : `${error.details[0].message}`}));

    let newTag = new Tag({
      name: req.body.name,
      lowQtyAlert: req.body.lowQtyAlert,
      expiryDateAlert: req.body.expiryDateAlert,
      location: req.body.location
    });

    newTag = await newTag.save();

    res.send(newTag);
  }
  catch (error) {
    res.status(500).send(`Error Creating Tag: ${error}`);
  }
});


/* get total number of tags available */
router.get('/count', async (req, res) => {
  try {
    const tagCount = await Tag.count();

    res.status(200).send(JSON.stringify({"count" : tagCount}));
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : `Error Reteriving Tag Counts: ${error}`}));
  }
});


/** get tag by id **/
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findById (req.params.id);

    if (!tag) return res.status(404).send("Tag(s) not found!");

    res.send(tag);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message": `Error reteriving tag by id: ${error}`}));
  }
});


/** edit tag by id **/
router.put("/:id", async (req, res) => {
  try {
    const update = Object.assign(req.body, { updated: new Date() });

    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      update,
      { new : true }
    );

    if (!updatedTag)
      return res.status(404).send("Tag Not Found");

    res.send(updatedTag);
  }
  catch (error) {
    res.status(500).send(`Error Editing Tag: ${error}`);
  }
});



/**
  Delete Tag By Id.
  *** WARNING ***
  If the tag is removed, every medicine related to the deleted tag also be removed.
**/
router.delete("/:id", async (req, res) => {
  try {
    const deletedTag = await Tag.findByIdAndRemove(req.params.id);

    if (!deletedTag)
      return res.status(404).send("Tag Not Found");

    const tagName = deletedTag.name;

    const removedMeds = await Medicine.deleteMany(
      {
        tag : tagName
      }
    );

    res.status(204).end("");
  }
  catch (error) {
    // process.stderror.write('{"status": "erorr", "message" : "error deleting tag"}');
    console.error(`Error Deleting Tag: ${error}`);
    res.status(500).send(`Error Deleting Tag: ${error}`);
  }
});



module.exports = router;
