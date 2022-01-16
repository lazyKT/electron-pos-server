const express = require('express');
const router = express.Router();

const { Specialization, validateSpecialEntry } = require('../schemas/specialization');
const { requestLogger } = require('../logger');
const validateObjectId = require('../middlewares/validateObjectId');
const { generateId } = require('../utils');



// get all specialization
router.get('/', async (req, res) => {
  try {
    let limit = 10;
    let page = 0;
    let sort = 'name';
    let order = 1;
    let sortObj = {};

    if (req.query.limit && parseInt(req.query.limit) > 0)
      limit = parseInt(req.query.limit);

    if (req.query.page && parseInt(req.query.page) > 0)
      page = parseInt(req.query.page) - 1;

    if (req.query.order && (req.query.order === '-1' || req.query.order === '1'))
      order = parseInt(req.query.order);

    if (req.query.sort && req.query.sort !== '')
      sort = req.query.sort;

    sortObj[sort] = order;

    const specialization = await Specialization.find(
      {},
      null,
      {
        skip: page * limit,
        limit
      }
    ).sort(sortObj);

    requestLogger(`[GET] ${req.baseUrl} - 200`);

    res.status(200).send(specialization);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// create new specialization
router.post('/', async (req, res) => {
  try {
    const specialId = generateId('sp');
    const requestBody = {
      ...req.body,
      specialId
    }

    const { error } = validateSpecialEntry(requestBody);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

    let specialization = new Specialization({
      specialId: specialId,
      name: req.body.name,
      remarks: req.body.remarks

    });

    specialization = await specialization.save();

    requestLogger(`[POST] ${req.baseUrl} - 201`);
    res.status(201).send(specialization);
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});





// get total number of specializations
router.get('/count', async (req, res) => {
  try {
    const count = await Specialization.count();

    requestLogger(`[GET] ${req.baseUrl}/count - 200`);
    res.status(200).send(JSON.stringify({'count' : count}));
  }
  catch (error) {
    requestLogger(`[GET] ${req.baaseUrl}/count - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});

// delete specialization by id
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const specialization = await Specialization.findByIdAndRemove(req.params.id);

    if (!specialization) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Deletion Fail!'}));
    }

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 204`);
    return res.status(204).send('');
  }
  catch (error) {
    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


module.exports = router;
