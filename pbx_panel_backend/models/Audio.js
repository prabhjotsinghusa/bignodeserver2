const mongoose = require('mongoose');
const AudioSchema = new mongoose.Schema({

    //pub_id: { type: Number, default: 0 },
    buyer_id: { type: Number, default: 0 },
    fileName: { type: String, required: true },
    status: { type: String, default: 'active' }

}, { timestamps: true });


mongoose.model('Audio', AudioSchema);
