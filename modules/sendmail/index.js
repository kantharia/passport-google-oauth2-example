var ses = require('node-ses');
var client = ses.createClient({
  key: process.env.AWS_SES_KEY,
  secret: process.env.AWS_SES_SECRET,
  amazon:process.env.AWS_SES_SERVER
});

console.log('AWS Server : ', process.env.AWS_SES_SERVER);

var from_email = 'chetan.kantharia@gmail.com';
var subject = 'Intro.ooo - Account Activation';


module.exports = {
  sendOTPEmail: function(data, meta_data){
    var mailContent = "Please active your account by entering OTP:" + data.otp;
        mailContent += "<br/><br/>Visit : " + meta_data.app_host +"/activation to activate your account."
    var to_email = data.username;

    client.sendEmail({
        to: to_email,
        from: from_email,
        subject: subject,
        message: mailContent
      },
      function(err, data, res){
        if(err){
          console.log('Sending OTP Error:', err);
        }
        if(res){
          console.log('Activation mail sent to:', to_email);
        }
     })
  }
}
