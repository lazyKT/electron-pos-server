const express = require("express");
const router = express.Router();


const { Tag, validateTag } = require("../schemas/tag");
const { Medicine } = require("../schemas/medicine");
const { requestLogger } = require("../logger");


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
  )
  .collation({ locale: "en" })
  .sort(sortObj);

  requestLogger(`[GET] ${req.baseUrl} - 200`);
  res.send(tags);
});



/** create new tag **/
router.post("/", async (req, res) => {
  try {

    const { error } = validateTag(req.body);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : `${error.details[0].message}`}));
    }

    let newTag = await Tag.findOne({ "name" : req.body.name});

    if (newTag) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "category already exists."}));
    }

    newTag = new Tag({
      name: req.body.name,
      lowQtyAlert: req.body.lowQtyAlert,
      expiryDateAlert: req.body.expiryDateAlert,
      location: req.body.location
    });

    newTag = await newTag.save();

    requestLogger(`[POST] ${req.baseUrl} - 200`);
    res.send(newTag);
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Creating Tag: ${error}`}));
  }
});


router.get("/search", async (req, res) => {
  try {
    let tags = await Tag.find(
      {"name" : {$regex: req.query.q, $options: "i"}}
    );

    requestLogger(`[GET] ${req.baseUrl}/search - 200`);
    res.status(200).send(tags);
  }
  catch  (error) {
    requestLogger(`[GET] ${req.baseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Searching Tag: ${error}`}));
  }
});


/* get total number of tags available */
router.get('/count', async (req, res) => {
  try {
    const tagCount = await Tag.count();

    requestLogger(`[GET] ${req.baseUrl}/count - 200`);
    res.status(200).send(JSON.stringify({"count" : tagCount}));
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/count - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Reteriving Tag Counts: ${error}`}));
  }
});


/** get tag by id **/
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findById (req.params.id);

    if (!tag) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(404).send("Tag(s) not found!");
    }

    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 200`);
    res.send(tag);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
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

    if (!updatedTag) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send("Tag Not Found");
    }

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 200`);
    res.send(updatedTag);
  }
  catch (error) {
    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 500`);
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

    if (!deletedTag) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send("Tag Not Found");
    }

    const tagName = deletedTag.name;

    const removedMeds = await Medicine.deleteMany(
      {
        tag : tagName
      }
    );

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 204`);
    res.status(204).end("");
  }
  catch (error) {
    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 500`);
    // process.stderror.write('{"status": "erorr", "message" : "error deleting tag"}');
    console.error(`Error Deleting Tag: ${error}`);
    res.status(500).send(`Error Deleting Tag: ${error}`);
  }
});



module.exports = router;
