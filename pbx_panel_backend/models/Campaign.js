const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const CampaignSchema = new mongoose.Schema({

    campaign_id: { type: Number, unique: true, index: true },
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },
    camp_name: { type: String, required: [true, "can't be blank"], trim: true, unique: true },
    buffer_time: { type: Number, default: 0 },
    price_per_call: { type: Number, default: 0 },
    created_at: { type: Date },
    status: { type: String, default: 'active' },
    time_zone: { type: String, default: 'CST' },
    queue_name: { type: String, default: null },
    queue_no: { type: String, default: null },
    read_only: { type: Number, default: 0 },
    inside_route: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });


CampaignSchema.plugin(AutoIncrement, { inc_field: 'campaign_id' });

mongoose.model('Campaign', CampaignSchema);
