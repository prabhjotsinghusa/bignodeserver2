const mongoose = require('mongoose');

const CampPubTfnSchema = new mongoose.Schema({
    camp_id: { type: Number, required: [true, "can't be blank"] },
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },
    tfn: { type: String, required: [true, "can't be blank"], trim: true },
    queue:{ type: String, default:null},
    created_at: { type: Date },
    status: { type: String, default: 'active' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

mongoose.model('Camp_Pub_Tfn', CampPubTfnSchema);