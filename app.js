var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var config = require('./config.js');
var User = require('./models/user');
var Bar = require('./models/bar');

mongoose.connect('mongodb://localhost/nightlife-webapp');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
// Init App
var app = express();

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: config.twitterKeys.CONSUMER_KEY,
    consumerSecret: config.twitterKeys.CONSUMER_SECRET,
    callbackURL: 'http://localhost:3000/login/twitter/return'
  },
  function(token, tokenSecret, profile, cb) {
    console.log(profile);
    return cb(null, profile);
}));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.get('/', function(req, res){
  res.sendFile('index.html');
});

app.get('/login/twitter',
passport.authenticate('twitter'));

app.get('/login/twitter/return', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/bars/:barid/strength', function(req, res){
    var id = req.params.barid;
    Bar.getBarById(id, function(err, bar){
      if(err) throw err;
      if(!bar){
       res.json({strength: 0});
      }
      else{
        res.json({strength: bar.strength});
      }

    });
});
app.get('/bars/go/:barid', function(req, res){
    var id = req.params.barid;
    Bar.getBarById(id, function(err, bar){
      if(err) throw err;
      if(!bar){
        var newBar=new Bar({
          id: id,
          strength: 1
        });
        Bar.createBar(newBar, function(err, bar){
          if(err) throw err;
          res.json({strength: 1});
        });
      }
      else{
        bar.strength++;
        
        bar.markModified('strength');
        bar.save(function(err, newBar){
          if(err) throw err;
          res.json({strength: newBar.strength});
        });
      }

    });
});
// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
console.log('Server started on port '+app.get('port'));
});