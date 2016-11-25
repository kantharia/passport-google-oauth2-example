console.log('Some libs');

function isEmailValid(email){
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
var app = {
  signupUser: function(){
    console.log('Signup User');

    //Get username and password
    var username = document.getElementById('username');
        username = username ? username.value : undefined;

    var password = document.getElementById('password');
        password = password ? password.value : undefined;

    console.log('Got username and password', username, password);

    if(!isEmailValid(username)){
      document.getElementById("status").innerHTML = "Email is invalid";
    }

    if(username && password && isEmailValid(username)){
      //submit form
      axios.post('/user', {username:username, password:password})
        .then(function(response){
          var _html = "<b>User Created successfully<b>"
              _html += "<p>We have sent you OTP. Please check you email and activte your account</p>";
          document.getElementById("signupform").innerHTML = _html;
        })
        .catch(function(error){
          if(error && error.response){
            alert("Error:" + error.response.data.status);
          } else {
            alert("Something went wrong please try again later.");
          }
        })

    } else {

      if(!isEmailValid(username)) {
        alert("Invalid Email Addess")
      }
      //show error
      alert("Username or password is blank");
    }
  }
}
