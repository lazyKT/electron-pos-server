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
      return res.status(400).send(erorr.details[0].message);

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

    validateLogin(username, password, function(result) {
      const { status, message } = result;

      if (status === 404)
        return res.status(404).send(message);

      if (status === 401)
        return res.status(403).send(message);

      res.status(200).send(message);
    });

    // const loginResult = await validateLogin(username, password);
  }
  catch (error) {
    res.status(500).send(`Error Login Employee: ${error}`);
  }
});


module.exports = router;
