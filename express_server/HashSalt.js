const bcrypt = require("bcryptjs");


module.exports = class HashSalt {

  #salt_round = 10;

  constructor (password) {
    this.password = password;
  }


  /** hash password with 10 round salts */
  doHash () {
    let hashPwd;
    bcrypt.genSalt(this.salt_round, (err, salt) => {
      if (err) {
        // Salt Error
        throw err;
      }
      else {
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (err) {
            // hash error
            throw err;
          }
          else {
            console.log(hash);
            hashPwd = hash;
          }
        });
      }
    });
    return hashPwd;
  }


  /** compare passwords */
  static cmpHash (pwd, hashPwd) {
    console.log(pwd, hashPwd)
    bcrypt.compare(pwd, hashPwd, (err, isMatch) => {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log("Password match :", isMatch);
      return isMatch;
    });
  }

}
