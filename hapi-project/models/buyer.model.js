const mongoose = require ('mongoose');

const BuyerSchema = new mongoose.Schema({

    buyer_id: { type: Number, unique: true, index: true },
    name: { type: String, default: null },
    password: { type: String, required: [true, "can't be blank"], trim: true },
    email: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], trim: true },
    contact: { type: String, default: null, trim: true },
    address: { type: String, required: [true, "can't be blank"], trim: true },
    price_per_call: { type: String, default: 'publisher' },
    status: { type: String, default: 'active' },
    buffer_time: { type: Number, default: 0 },
    pub_id: { type: Number, default: 0, required: true },
    created_at: { type: Date, default: Date.now }
  
  
  });

module.exports = mongoose.model('Buyer', BuyerSchema);