const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const AssignedPublisherSchema = new mongoose.Schema({

    audit_profile_id: { type: Number,required:[true, "can't be blank"]},
    pub_id: { type: Number,required:[true, "can't be blank"],ref:'User'},
    status: { type: String, default: 'active' }

},{ timestamps: false });


mongoose.model('Assigned_Publisher', AssignedPublisherSchema);
