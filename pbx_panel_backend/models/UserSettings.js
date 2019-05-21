const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;


const UserSettingsSchema = new mongoose.Schema({

    pub_id: { type: Number, required: true },
    enabled_record: { type: Number, default: 0 },
    daily_tfns: { type: Number, default: 0 },
    monthly_tfns: { type: Number, default: 0 },
    display_cnum: { type: Number, default: 0 },
    display_wallet: { type: Number, default: 1 },
    phone_system: { type: Number, default: 1 },
    call_reducer: { type: Number,default: 0},
    enable_inside_route: { type: Number, default: 1 },
    enable_outside_route: { type: Number, default: 0 },
    buyer_limit: { type: Number, default: 0 },
    usage_module: { type: Number, default: 0 },
    filtered: { type: Number, default: 1 },
    number_to_ivr: { type: Number, default: 0 },
    show_buyer_no: { type: Number, default: 0 },
    hide_campaign: { type: Number, default: 0 },
    charge_per_minute: { type: Number, default: 0 },

},{ timestamps: false });



UserSettingsSchema.methods.generateJWT = function () {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
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

mongoose.model('User_Settings', UserSettingsSchema);
