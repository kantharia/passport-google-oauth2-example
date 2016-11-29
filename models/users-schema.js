var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  username: String,
  password: String,
  otp: Number,
  active: Boolean,
  subdomain: String,
  fullname: String,
  dob: Date, // ISO Date format (OPTIONAL)
  age: Number, // (REQUIRED)
  profession: String,
  city: String,
  bio: String // About me
});

module.exports = mongoose.model('users', schema);
