var helper = require('sendgrid').mail;
var from_email = new helper.Email('chetan.kantharia@gmail.com');
var subject = 'Intro.ooo - Account Activation';

var api_key = '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';
var sg = require('sendgrid')(api_key);

module.exports = {
  sendOTPEmail: function(data, meta_data){
    var mailContent = "Please active your account by entering OTP:" + data.otp;
        mailContent += "\n\n Visit : " + meta_data.app_host +"/activation to activate your account."
    var content = new helper.Content('text/plain', mailContent)
    var to_email = new helper.Email(data.username);
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });

  }
}
