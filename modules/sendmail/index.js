var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
    host: 'email-smtp.us-west-2.amazonaws.com',
    port: 2587,
    auth: {
        user: 'AKIAISKFFHKKLW6XZVDA',
        pass: 'ApFw1SzH5OmYkz1vLw7j+RwsLdKxL4WpqifY7GxiT0dE'
    }
}));

console.log('Using SMTP')

// create reusable transporter object using the default SMTP transport
//var transporter = nodemailer.createTransport('smtps://'+ from +':'+ pass +'@smtp.gmail.com');

var from_email = 'chetan.kantharia@gmail.com';
var subject = 'Intro.ooo - Account Activation - aws';

module.exports = {
  sendOTPEmail: function(data, meta_data){
    var activationLink = meta_data.app_host+"/activation";

    var mailContent = "Please active your account by entering OTP:" + data.otp;
        mailContent += "Visit :" + activationLink +"to activate your account."

    var mailContentHTML = "Please active your account by entering OTP:" + "<b>"+data.otp+"</b>";
        mailContentHTML += "<br/><br/>Visit : <a href="+activationLink+">" + activationLink +"</a> to activate your account."
    var to_email = data.username;

    var mailOptions = {
      from: from_email, // sender address
      to: to_email, // list of receivers
      subject: subject, // Subject line
      text: mailContent, // plaintext body
      html: mailContentHTML // html body
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      }
      else{
        console.log('Message sent: ' + info.response);
      }
    });
  }
}
