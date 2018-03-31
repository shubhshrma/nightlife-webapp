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

mongoose.connect('mongodb://root:humroothai@ds129939.mlab.com:29939/nightlife-webapp');
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
    User.getUserByUsername(req.user.username, function(err, user){
      if(err) throw err;
      if(!user){
        var newUser=new User({
          username: req.user.username,
          places: Array
        });
        User.createUser(newUser, function(err, newUser1){
          if(err) throw err;
        })
      }
    })
    res.redirect('/');
});

app.get('/logout', function(req, res){
  req.logout();
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
    var username = req.user.username;
    var id = req.params.barid;
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      var placeAlreadyPresent=user.places.findIndex(function(e){
        return e===id;
      });
      if(placeAlreadyPresent===-1){
        user.places.push(id);
        user.markModified('places');
        user.save(function(err, newUser){
          if(err) throw err;

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
      }
      else
      {
        Bar.getBarById(id, function(err, bar){
          if(err) throw err;
          res.json({strength: bar.strength});
        })
      };
    });
});

app.get('/bars/remove/:barid', function(req, res){
    
    var username = req.user.username;
    var barid = req.params.barid;
    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        var barPresent = user.places.findIndex(id => {
            return id === barid;
        });
        console.log(barPresent);
        if (barPresent>=0) {
            user.places.splice(barPresent, 1);
            user.markModified('places');
            user.save(function(err, newUser){
                if (err) throw err;
                Bar.getBarById(barid, function (err, bar) {
                    if (err) throw err;

                    bar.strength--;
                    bar.markModified('strength');
                    bar.save(function (err, newBar) {
                        if (err) throw err;
                        res.json({strength: newBar.strength});
                    });
                })
            })
        }
        else {
            Bar.getBarById(barid, function (err, bar) {
                if (err) throw err;
                res.json({strength: bar.strength})
            })
        }
    });

});
app.get('/userstate', function(req, res){
  var user=req.user?req.user:false;
  res.json({user:user});

});
app.get('/users/:username/bars', function(req, res){
  User.getUserByUsername(req.user.username, function(err, user){
    if(err) throw err;
    console.log(1);
    res.json({places: user.places});
  });
});

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
console.log('Server started on port '+app.get('port'));
});