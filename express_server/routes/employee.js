const express = require("express");
const router = express.Router();

const {
  Employee,
  validateEmployee,
  validateLogin
} = require("../schemas/employee");


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
    );

    res.status(200).send(employees);
  }
  catch (error) {
    res.status(500).send(`Error getting employees: ${error}`);
  }
});


/** create new employee **/
router.post("/", async (req, res) => {
  try {
    const { error } = validateEmployee(req.body);
    if (error)
      return res.status(400).send(error.details[0].message);

    const existingEmp = await Employee.findOne({"username" : req.body.username});
    if (existingEmp)
      return res.status(400).send(JSON.stringify({"message" : "User Already Exists!"}));

    let emp = new Employee({
      username: req.body.username,
      level: req.body.level,
      mobile: req.body.mobile,
      password: req.body.password
    });

    emp = await emp.save();

    res.status(201).send(emp);
  }
  catch (error) {
    res.status(500).send(`Error Creating New Employee: ${error}`);
  }
});



router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const emp = await Employee.findOne({"username" : username});

    if (!emp)
      return res.status(400).send(JSON.stringify({"message" : "invalid username/password"}));

    validateLogin(username, password, function(result) {
      const { status, message } = result;

      if (status === 404)
        return res.status(404).send(JSON.stringify({"message" : message}));

      if (status === 401)
        return res.status(403).send(JSON.stringify({"message" : message}));

      res.status(200).send(JSON.stringify({"message" : message}));
    });

    // const loginResult = await validateLogin(username, password);
  }
  catch (error) {
    res.status(500).send(`Error Login Employee: ${error}`);
  }
});



/* filter employees by search keyword */
router.get("/search", async (req, res) => {
  try {

    // find by username
    const emps = await Employee.find(
      {"username" : {$regex: req.query.q, $options: "i"}}
    );

    res.status(200).send(emps);

  }
  catch (error) {
    res.status(500).send(`Error Seraching Employee Data: ${error}`);
  }
});


/** get employee by id **/
router.get("/:id", async(req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);

    if (!emp)
      return res.status(404).send(JSON.stringify({"message" : "Employee Not Found!"}));

    res.status(200).send(emp);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : "Server Error on Getting Employee By Id."}))
  }
});


/** edit employee **/
router.put("/:id", async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new : true }
    );

    if (!emp)
      return res.status(404).send(JSON.stringify({"message" : "Employee Not Found"}));

    res.status(201).send(emp);
  }
  catch (error) {
    res.status(500).send(JSON.stringify({"message" : "Server Error on Editing Employee"}));
  }
});


module.exports = router;
