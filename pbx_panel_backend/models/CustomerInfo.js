var mongoose = require('mongoose');

var CustomerInfoSchema = new mongoose.Schema({

  agentid:{ type: String},
  customernumber: { type: String},
  concern: { type: String},
  time: { type: String},
  
}, {timestamps: true});

// // Requires population of author
// CommentSchema.methods.toJSONFor = function(user){
//   return {
//     id: this._id,
//     body: this.body,
//     createdAt: this.createdAt,
//     author: this.author.toProfileJSONFor(user)
//   };
// };

mongoose.model('CustomerInfo', CustomerInfoSchema);
