const mongoose = require('mongoose');
//const AutoIncrement = require('mongoose-sequence')(mongoose);


const PublisherFinanceSchema = new mongoose.Schema({
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },
    cal_month: { type: String, default: '' },
    cal_year: { type: String, default: '' },
    start_date: { type: String, default: '' },
    end_date: { type: String, default: '' },
    total_amount: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    cron_status: { type: String, default: 'pending' }
}, { timestamps: true });


//CampaignSchema.plugin(AutoIncrement, { inc_field: 'campaign_id' });

mongoose.model('Publisher_Finance', PublisherFinanceSchema);
