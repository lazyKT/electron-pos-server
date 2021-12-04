const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Lodash = require("lodash");
const validateObjectId = require('../middlewares/validateObjectId');


const {
  Employee,
  validateEmployee,
  validateEmployeeEditRequest,
  validateLogin
} = require("../schemas/employee");
const { requestLogger } = require("../logger");



/** Get all employee **/
router.get("/", async (req, res) => {
  try {

    let page = 0;
    let limit = 10;

    if (req.query.page)
      page = parseInt(req.query.page) - 1;

    if (req.query.limit)
      limit = parseInt(req.query.limit);

    const employees = await Employee.find(
      null,
      null,
      { page: limit * page, limit }
    ).sort({username: 1});

    let emps = employees.map( e => e=Lodash.pick(e, ["_id", "username", "fullName", "mobile", "level"]));

    requestLogger(`[GET] ${req.baseUrl} - 200`);
    res.status(200).send(emps);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl} - 500`);
    res.status(500).send(`Error getting employees: ${error}`);
  }
});


/** create new employee **/
router.post("/", async (req, res) => {
  try {
    const { error } = validateEmployee(req.body);
    if (error) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message": error.details[0].message}));
    }

    const existingEmp = await Employee.findOne({"username" : req.body.username});
    if (existingEmp) {
      requestLogger(`[POST] ${req.baseUrl} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "User Already Exists!"}));
    }

    let emp = new Employee({
      username: req.body.username,
      level: req.body.level,
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      password: req.body.password
    });

    emp = await emp.save();

    requestLogger(`[POST] ${req.baseUrl} - 201`);
    res.status(201).send(Lodash.pick(emp, ["username", "fullName", "level", "mobile", "_id"]));
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl} - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Creating New Employee: ${error}`}));
  }
});



router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const emp = await Employee.findOne({"username" : username});

    if (!emp) {
      requestLogger(`[POST] ${req.baseUrl}/login - 400`);
      return res.status(400).send(JSON.stringify({"message" : "invalid username/password"}));
    }

    validateLogin(username, password, function(result) {
      const { status, message, emp } = result;

      if (status === 404) {
        requestLogger(`[POST] ${req.baseUrl}/login - 404`);
        return res.status(404).send(JSON.stringify({"message" : message}));
      }

      if (status === 401) {
        requestLogger(`[POST] ${req.baseUrl}/login - 401`);
        return res.status(401).send(JSON.stringify({"message" : message}));
      }

      let empData = Lodash.pick(emp, ["_id", "username", "mobile", "level", "fullName"]);

      requestLogger(`[POST] ${req.baseUrl}/login - 200`);
      res.status(200).send(empData);
    });

    // const loginResult = await validateLogin(username, password);
  }
  catch (error) {
    requestLogger(`[POST] ${req.baseUrl}/login - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Login Employee: ${error}`}));
  }
});



/* filter employees by search keyword */
router.get("/search", async (req, res) => {
  try {

    // find by username
    let emps = await Employee.find(
      {"username" : {$regex: req.query.q, $options: "i"}}
    );

    emps = emps.map(emp => Lodash.pick(emp, ["_id", "username", "fullName", "mobile", "level"]));


    requestLogger(`[GET] ${req.baseUrl}/search - 200`);
    res.status(200).send(emps);
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/search - 500`);
    res.status(500).send(JSON.stringify({"message" : `Error Searching Employee. ${error}`}));
  }
});


/** get employee by id **/
router.get("/:id", validateObjectId, async(req, res) => {
  try {

    const emp = await Employee.findById(req.params.id);

    if (!emp) {
      requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Employee Not Found!"}));
    }

    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 200`);
    res.status(200).send(Lodash.pick(emp, ["_id", "username", "mobile", "level", "fullName"]));
  }
  catch (error) {
    requestLogger(`[GET] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({"message" : "Server Error on Getting Employee By Id."}))
  }
});


/** edit employee **/
router.put("/:id", validateObjectId, async (req, res) => {
  try {

    const { error, message } = validateEmployeeEditRequest(req.body);
    if (error) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({"message" : message}));
    }

    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new : true }
    );

    if (!emp) {
      requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 404`);
      return res.status(404).send(JSON.stringify({"message" : "Employee Not Found"}));
    }

    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 201`);
    res.status(201).send(Lodash.pick(emp, ["_id", "username", "fullName", "mobile", "level"]));
  }
  catch (error) {
    requestLogger(`[PUT] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({"message" : "Server Error on Editing Employee"}));
  }
});


/** delete employee **/
router.delete("/:id", validateObjectId, async (req, res) => {
  try {

    const emp = await Employee.findByIdAndRemove(req.params.id);

    if (!emp) {
      requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 400`);
      return res.status(400).send(JSON.stringify({"message" : "User Not Found!"}));
    }

    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 200`);
    res.status(200).send(emp);
  }
  catch(error) {
    requestLogger(`[DELETE] ${req.baseUrl}/${req.params.id} - 500`);
    res.status(500).send(JSON.stringify({"message" : "Internal Server Error"}));
  }
});


module.exports = router;
