const mongoose = require('mongoose');

const CampBuyerTfnSchema = new mongoose.Schema({
    camp_id: { type: Number, required: [true, "can't be blank"] },
    buyer_id: { type: Number, default: null, required: [true, "can't be blank"] },
    buyers_no: { type: String, required: [true, "can't be blank"], trim: true },
    created_at: { type: Date },
    status: { type: String, default: 'active' },
    priority: { type: Number, default: 0 },
    cccapping: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

mongoose.model('Camp_Buyer_Tfn', CampBuyerTfnSchema);