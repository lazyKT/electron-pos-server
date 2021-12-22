const express = require('express');
const router = express.Router();

const { Service, validateServiceEntry } = require('../schemas/service');
const { requestLogger } = require('../logger');
const validateObjectId = require('../middlewares/validateObjectId');
const { generateId } = require('../utils');



// get all services
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

    const services = await Service.find(
      {},
      null,
      {
        skip: page * limit,
        limit
      }
    ).sort(sortObj);

    requestLogger(`[GET] ${req.baseUrl} - 200`);

    res.status(200).send(services);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// create new service
router.post('/', async (req, res) => {
  try {
    const serviceId = generateId('sv');
    const requestBody = {
      ...req.body,
      serviceId
    }

    const { error } = validateServiceEntry(requestBody);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({'message' : error.details[0].message}));
    }

    let service = new Service({
      serviceId: serviceId,
      name: req.body.name,
      price: req.body.price,
      remarks: req.body.remarks
    });

    service = await service.save();

    requestLogger(`[POST] ${req.baseUrl} - 201`);
    res.status(201).send(service);
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// search service by name
router.get('/search', async (req, res) => {
  try {
    let services = [];

    if (req.query.q && req.query.q !== '') {
      services = await Service.find({
        'name' : { $regex : req.query.q, $options: 'i' }
      });
    }

    requestLogger(`[GET] ${req.baseUrl}/search - 200`);

    res.status(200).send(services);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baaseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get total number of services
router.get('/count', async (req, res) => {
  try {
    const count = await Service.count();

    requestLogger(`[GET] ${req.baseUrl}/count - 200`);
    res.status(200).send(JSON.stringify({'count' : count}));
  }
  catch (error) {
    requestLogger(`[GET] ${req.baaseUrl}/count - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// get service by id
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({'message' : 'Service Not Found!'}));
    }

    res.status(200).send(service);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// edit/update service by id
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated: new Date()},
      { new: true }
    );

    if (!service) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({'message' : 'Update Fail!'}));
    }

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 200`);
    return res.status(200).send(service);
  }
  catch (error) {
    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({'message' : 'Internal Server Error!'}));
  }
});


// delete service by id
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const service = await Service.findByIdAndRemove(req.params.id);

    if (!service) {
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
