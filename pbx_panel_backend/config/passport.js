var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Buyer = mongoose.model('Buyer');
const md5 = require('md5');

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});



passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function (username, password, done) {
 
  User.findOne({ username: username, status: { $in: ['Active', 'active'] } }).then(function (user) {
    if (user && user.validPassword(password)) {
      return done(null, user);      
    }else {
      Buyer.findOne({ email: username,password:md5(password), status: { $in: ['Active', 'active'] } }).then(function (buyer) {      
        if (!buyer) {
          return done(null, false, { success: 'NOK', errors: { 'username or password': 'is invalid' } });
        }
        return done(null, buyer);
      });
    }  
    
  }).catch(done);
}));

