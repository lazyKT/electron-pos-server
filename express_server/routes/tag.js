const express = require("express");
const router = express.Router();


const { Tag } = require("../schemas/tag");


router.get("/", async (req, res) => {
  const tags = await Tag.find();

  res.send(tags);
});



router.post("/", async (req, res) => {
  try {
    let newTag = new Tag({
      name: req.body.name,
      lowQtyAlert: req.body.lowQtyAlert,
      expiryDateAlert: req.body.expiryDateAlert
    });

    newTag = await newTag.save();

    res.send(newTag);
  }
  catch (error) {
    res.send(`Error Creating Tag: ${error}`);
  }
});


router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findById (req.params.id);

    if (!tag) return res.status(404).send("Tag(s) not found!");

    res.send(tag);
  }
  catch (error) {
    res.status(500).send(`Error reteriving tag by id: ${error}`);
  }
});


module.exports = router;
