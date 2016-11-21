var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  username: String,
  password: String,
  otp: Number,
  active: Boolean
});

module.exports = mongoose.model('users', schema);
