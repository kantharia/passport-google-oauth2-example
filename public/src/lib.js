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
function checkObject(obj, ignoredKeys){
  var keysWithNullValues = [];
  var ignoredKeys = ignoredKeys || [];
  for (var i in obj){
    if(!obj[i]){
      if(ignoredKeys.indexOf(i)<0){
        keysWithNullValues.push(i);
      }
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
      age: get('age') || 0,
      profession: get('profession'),
      city: get('city'),
      bio: get('bio')
    }

    var err_feilds = checkObject(userObj, ['dob','age']);

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
  },
  postOnFB: function(token){
    var fbPost = getValById('fbPost');
    console.log('FB POST', fbPost);
    var _url = 'https://graph.facebook.com/v2.8/me/feed?access_token='+token;
    axios.post(_url, {"message":fbPost})
      .then(function(response){
        setValById('fbPost','');
        alert("Publish Successful on FB");
      })
      .catch(function(e){
        console.log('Error in FB Publish');
      })
  },
  postOnTwitter: function(token, tokenSecret){
    console.log('Token : ', token);
    console.log('Token Secret : ', tokenSecret);
    var twitterPost = getValById('twitterPost');

    var twitterClient = axios.create({
      headers: {
        'token': token,
        'token-secret': tokenSecret
      }
    });

    twitterClient.post('/twitter/post', {"tweet":twitterPost})
      .then(function(response){
        console.log('Response', response);
        setValById('twitterPost','');
      })
      .catch(function(e){
        console.log('Error in twitter post')
      })
  },
  postOnLinkedin: function(token, tokenSecret){
    console.log('Token :', token);
    console.log('Secret : ', tokenSecret);
    var linkedinPost = getValById('linkedinPost');

    var linkedinClient = axios.create({
      headers: {
        'token' : token,
        'token-secret': tokenSecret
      }
    });

    var _pay_load = {
      "comment": linkedinPost,
      "visibility": {
        "code": "anyone"
      }
    }

    linkedinClient.post('/linkedin/post', { "payload": _pay_load })
      .then(function(response){
        console.log('Response :', response);
        alert("Status Posted!")
        setValById('linkedinPost','');
      })
      .catch(function(e){
        alert("Error while updating linkedin post")
        console.log('Something went wrong : ', e)
      })
  }
}
