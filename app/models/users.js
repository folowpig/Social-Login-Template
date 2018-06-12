//./app/models/users.js

const mongoose = require('mongoose'),
      bcrypt = require('bcrypt-nodejs');

var userScheme = mongoose.Schema({
  //Local saves email and password only
  local            : {
    email        : String,
    password     : String,
    data         : String
  },

  //Other social (Google) saves its token and id
  google           : {
    id           : String,
    token        : String,
    name         : String,
    email        : String,
    data         : String
  }

  //Add more social login user schema if necessary
});

//Generate hash for security reasons
userScheme.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userScheme.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userScheme);