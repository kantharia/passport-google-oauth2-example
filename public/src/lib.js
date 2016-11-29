console.log('Some libs');

function isEmailValid(email){
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function getValById(id){
  return document.getElementById(id).value || null;
}

function setValById(id,val){
  return document.getElementById(id).value = val || null;
}

// Returns array of keys which has null values
function checkObject(obj){
  var keysWithNullValues = [];
  for (var i in obj){
    if(!obj[i]){
      keysWithNullValues.push(i);
    }
  }
  return keysWithNullValues;
}

var get = getValById;
var set = setValById;

var app = {
  subdomain:'',
  checkSubdomain: function(){
    var self = this;
    var subdomain = document.getElementById('subdomain').value;
    var preview;
    console.log('Subdomain :', subdomain);
    if(subdomain){
      preview = "http://" + subdomain + ".intro.ooo";
    } else {
      preview = "";
      document.getElementById('status').innerHTML = "";
    }
    document.getElementById('preview').innerHTML = preview;
    axios.get('/subdomain/?sd='+subdomain)
      .then(function(response){
        if(response.data.available){
          self.subdomain = subdomain;
          document.getElementById('status').innerHTML = "[available]"
          document.getElementById('status')
            .style.background = '#E6F7C2';
        } else {
          self.subdomain = null;
          document.getElementById('status').innerHTML = "[Already registered]";
          document.getElementById('status')
            .style.background = '#f9a186';
        }
      })
      .catch(function(err){
        console.log('Error : ',err);
        self.subdomain = null;
        document.getElementById('status').innerHTML = "[Already registered]";
        document.getElementById('status')
          .style.background = '#f9a186';
      })
  },
  registerSubdomain: function(){
    console.log('This.subdomain', this.subdomain);
    if(this.subdomain){
      axios.post('/subdomain', { subdomain :this.subdomain})
        .then(function(response){
          console.log('Message', response);
          if(response.status === 200){
            window.location = '/update-profile';
            // alert(response.data.message);
          }
        })
        .catch(function(err){
          console.log(err)
        })
    }
  },
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
  },
  updateProfile: function(){
    var userObj = {
      fullname: get('fullname'),
      dob: get('dob'),
      age: get('age'),
      profession: get('profession'),
      city: get('city'),
      bio: get('bio')
    }

    var err_feilds = checkObject(userObj);

    if(err_feilds.length){
      var str = err_feilds.map(function(d){ return d });
      alert('Required feilds are : ' + str.join(', '));
    }

    if(!err_feilds.length){
      axios.post('/profile', userObj)
        .then(function(response){
          if(response.status === 200){
            window.location = '/';
          }
        })
        .catch(function(error){
          alert('Something went wrong while saving profile');
          console.log('Error');
        })
    }
  }
}
