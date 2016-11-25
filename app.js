require('dotenv').config();
var authConfig = require('./config/auth'),
  express = require('express'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  TwitterStrategy = require('passport-twitter').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy
  LinkedInStrategy = require('passport-linkedin').Strategy
  LocalStrategy = require('passport-local').Strategy
  SendMail = require('./modules/sendmail');

var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var env = process.env.NODE_ENV || 'local';
var app_host = process.env.APP_HOST;

console.log('APP_HOST', process.env.APP_HOST);

// mongoose model for user
var User = require('./models/users-schema.js');

// Connect mongodb - Local
var db_host = process.env.DB_HOST;

var db_connection_string = 'mongodb://' + db_host + '/webchat'
mongoose.connect(db_connection_string);

// Passport session setup.
//
//   For persistent logins with sessions, Passport needs to serialize users into
//   and deserialize users out of the session. Typically, this is as simple as
//   storing the user ID when serializing, and finding the user by ID when
//   deserializing.
passport.serializeUser(function(user, done) {
  // done(null, user.id);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // Users.findById(obj, done);
  done(null, obj);
});


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
//   See http://passportjs.org/docs/configure#verify-callback
passport.use(new GoogleStrategy(

  // Use the API access settings stored in ./config/auth.json. You must create
  // an OAuth 2 client ID and secret at: https://console.developers.google.com
  authConfig.google,

  function(accessToken, refreshToken, profile, done) {
    console.log('access : ', accessToken);
    console.log('refresh : ', refreshToken);
    // Typically you would query the database to find the user record
    // associated with this Google profile, then pass that object to the `done`
    // callback.
    return done(null, profile);
  }
));

// Passport middleware for Twitter Strategy
passport.use(new TwitterStrategy(authConfig.twitter,
  function(token, tokenSecret, profile, done) {
    return done(null, profile);
  }
));

// Passport middleware for Facebook Strategy
passport.use(new FacebookStrategy(authConfig.facebook,
  function(accessToken, refreshToken, profile, done){
      console.log('Access Token : ', accessToken);
      console.log('refreshToken : ', refreshToken);
      return done(null, profile);
  })
);

// Passport middleware for LinkedIn Strategy
passport.use(new LinkedInStrategy({
    consumerKey: "81o64ppbkdkoky",
    consumerSecret: "8BjO1VzFBppBXeM1",
    callbackURL: "/auth/linkedin/callback",
    profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
  },
  function(token, tokenSecret, profile, done) {
    console.log('LinkedIn Token : ', token);
    console.log('LinkedIn Secret : ', tokenSecret);
    return done(null, profile);
  }
))

/**
 * LocalStrategy
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// Express 4 boilerplate

var app = express();
app.set('view engine', 'hbs');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));


// Application routes

app.get('/', function(req, res) {
  res.render('index', {
    user: req.user
  });
});

// Registartion page
app.get('/signup', function(req, res){
  res.render('signup',{});
})


// Get Login page
app.get('/login', function(req, res) {
  res.render('login', {
    user: req.user
  });
});


/**
 * Google Auth Route
 */
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['openid email profile'],
    accessType: 'offline',
    approvalPrompt: 'force'
  }));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Authenticated successfully
    res.redirect('/');
  });

/**
 * Twitter Auth Route
 */
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

/**
 * Facebook Auth Routes
 */
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope:['email user_about_me user_hometown user_location user_website user_work_history']
  })
);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

/**
 * LinkedIn Auth routes
 */
app.get('/auth/linkedin', passport.authenticate('linkedin',{
    scope: ['r_basicprofile', 'r_emailaddress']
  })
);
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

/**
 * Email Login Route
 */
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
  });

app.get('/user', ensureAuthenticated, function(req, res) {
  res.json({
    user: req.user
  })
})

/**
 * Create user with username and password
 * username be consider as email
 */
app.post('/user', function(req, res) {

  console.log('/user got post req');

  var getOTP = generateOTP();

  getOTP.then(function(otp){

    var _data = {
      "username":req.body.username,
      "password":req.body.password,
      "otp":otp,
      "active": false
    }

    var user = new User(_data);

    User.findOne({"username":req.body.username}, function(err, data){
      if(err){
        return res.json({"error":"Error while fetcthing user"});
      }

        if(!data){
          user.save();
          response_message = "User created successfully."
          SendMail.sendOTPEmail(_data, { "app_host": app_host} );
          return res.status(200).json({status:response_message});
        } else {
          response_message = "User already created."
          return res.status(409).json({status:response_message});
        }
    })
    // res.end('done');
  }, function(err) {
    console.log('Got Error : ', err);
    res.end('done with error');
  });
});

/**
 * Activation Page and POST Route
 */
app.get('/activation', function(req, res){
  res.render('activation');
})
app.post('/activation', function(req, res){
  var otp = Number(req.body.otp);

  User.findOneAndUpdate({"otp":otp}, {"active":true}, {"upsert":false}, function(err, doc){
    if(err) res.send(500, {error:err})
    if(doc){
      return res.send({"account_activated":true});
    } else {
      return res.send({"error":"invalid auth token"});
    }

  });
})

/**
 * User Current User JSON
 */
app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', {
    user: req.user
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(process.env.PORT || 9090, function() {
  console.log("Listening...");
});


// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

/**
 * Generate random number for OTP
 */
function generateOTP(){
  var otp = getRandomNumber(5);
  var _p = new Promise(function(resolve, reject){
    User.findOne({"otp":otp}, function(err, data){
      if(err){
        // Got some error
        console.log('Error while checking OTP', err);
        reject(null);
      }

      if(data){
        // OPT Already present
        console.log('OPT Already present');
        generateOTP();
      }

      if(!data){
        // OPT Not allocated to any user
        console.log('OPT Not allocated to any user :', otp);
        resolve(otp);
      }
    })
  });
  return _p;
}

function getRandomNumber(length){
  // Calculate zeros
  function getMaxLimit(limit){
    var num = '1';
    for(var i=0; i<limit; i++){
      num += '0';
    }

    return Number(num);
  }

  return Math.round(Math.random()*getMaxLimit(length))
}
