var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  username: String,
  password: String,
  otp: Number,
  active: Boolean,
  subdomain: String,
  fullname: String,
  dob: { type:Date, default: new Date('0000-01-01')},// ISO Date format (OPTIONAL)
  age: { type: Number, default: 0}, // (REQUIRED)
  profession: String,
  city: String,
  bio: String // About me
});

module.exports = mongoose.model('users', schema);
