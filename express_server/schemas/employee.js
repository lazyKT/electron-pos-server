const mongoose = require("mongoose");
const Joi = require("joi")
              .extend (require("@joi/date"));
const bcrypt = require("bcryptjs");



const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 4,
    maxLength: 20,
    required: true,
    index: { unique: true }
  },
  mobile: {
    type: String,
    minLength: 6,
    maxLength: 15,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});


function validateEmployee (emp) {
  const schema = Joi.object({
    username: Joi.string().required(),
    mobile: Joi.string().required(),
    level: Joi.number().integer().min(1).max(3).required(),
    password: Joi.string().required()
  });

  const validationResult = schema.validate(emp);

  return validationResult;
}


/**
  the below Mongoose 'pre' middleware function is called
  everytime we save/add new document.
  Our goal here is to hash and assign password before the document is saved.
  after successful hashing and assignment, next() function tell the node runtime to move on to
  another middleware, which is save()
**/
employeeSchema.pre("save", function (next) {
  try {
    const emp = this;

    if (this.isModified("password") || this.isNew) {
      bcrypt.genSalt(10, function (err, salt) {
        if (err)
          throw err;

        else {
          bcrypt.hash(emp.password, salt, function(err, hash) {
              if (err)
                return next(err);

              emp.password = hash;
              next();
          });
        }
      });
    }
    else {
      return next();
    }
  }
  catch (error) {
    console.error(`Error Hashing Employee Passwords: ${error}`);
  }
});


/** compare passwords */
employeeSchema.methods.comparePassword = function (password, callback) {
  try {
    bcrypt.compare(password, this.password, function(err, isMatch) {
      if (err)
        return callback(err);

      callback(null, isMatch);
    })
  }
  catch (error) {
    console.error (`Error validating emp login: ${error}`);
  }
}


/**
# Validating Employee Login
**/
function validateLogin (username, password, callback) {
  try {
    Employee.findOne({"username": username}).exec(function (error, emp) {
      if (error)
        throw error;

      else if (!emp)
        callback({status: 400, message: "bad request"});

      else if (emp) {

        emp.comparePassword(password, function (err, isMatch) {
          if (err)
            throw err;

          else if (isMatch)
            callback({status: 200, message: "success"});

          else
            callback({status: 401, message: "failed"});
        })
      }
    });
  }
  catch (err) {
    console.error(`Error Validating Login: ${err}`);
  }
}


const Employee = new mongoose.model ("Employee", employeeSchema);


exports.Employee = Employee;
exports.validateEmployee = validateEmployee;
exports.validateLogin = validateLogin;
