const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;
const md5 = require('md5');
const debugHttpIncoming = require('debug')('http:incoming')
const debugHttpOutgoing = require('debug')('http:outgoing')




const UserSchema = new mongoose.Schema({

  uid: { type: Number, unique: true, index: true },
  username: { type: String, default: null },
  fullname: { type: String, required: [true, "can't be blank"], trim: true },
  email: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], trim: true },
  contact: { type: String, default: null, trim: true },
  password: { type: String, required: [true, "can't be blank"], trim: true },
  role: { type: String, default: 'publisher' },
  login_token: { type: String },
  created_at: { type: Date },
  status: { type: String, default: 'active' },
  price_per_tfn: { type: Number, default: 0 },
  pub_queue: { type: String, default: 'others' },
  isDeleted: { type: Boolean, default: 'false' }

}, { timestamps: true });

UserSchema.plugin(AutoIncrement, { inc_field: 'uid' });
// UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.validPassword = function (password) { 
  var hash = md5(password);
  return this.password === hash;
};

// UserSchema.methods.setPassword = function (password) {
//   this.salt = crypto.randomBytes(16).toString('hex');
//   this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
// };


UserSchema.methods.generateJWT = function () {
  
  return jwt.sign({

    id: this._id,
    username: this.username,
    exp: (Math.floor(Date.now() / 1000) + 1*24*60*60)
  }, secret);

};

// UserSchema.methods.toAuthJSON = function () {
//   return {
//     username: this.username,
//     email: this.email,
//     token: this.generateJWT(),
//     bio: this.bio,
//     image: this.image
//   };
// };

// UserSchema.methods.toProfileJSONFor = function (user) {
//   return {
//     username: this.username,
//     bio: this.bio,
//     image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
//     following: user ? user.isFollowing(this._id) : false
//   };
// };

// UserSchema.methods.favorite = function (id) {
//   if (this.favorites.indexOf(id) === -1) {
//     this.favorites.push(id);
//   }

//   return this.save();
// };

// UserSchema.methods.unfavorite = function (id) {
//   this.favorites.remove(id);
//   return this.save();
// };

// UserSchema.methods.isFavorite = function (id) {
//   return this.favorites.some(function (favoriteId) {
//     return favoriteId.toString() === id.toString();
//   });
// };

// UserSchema.methods.follow = function (id) {
//   if (this.following.indexOf(id) === -1) {
//     this.following.push(id);
//   }

//   return this.save();
// };

// UserSchema.methods.unfollow = function (id) {
//   this.following.remove(id);
//   return this.save();
// };

// UserSchema.methods.isFollowing = function (id) {
//   return this.following.some(function (followId) {
//     return followId.toString() === id.toString();
//   });
// };

mongoose.model('User', UserSchema);
