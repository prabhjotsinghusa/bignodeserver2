const mongoose = require('mongoose');
//const AutoIncrement = require('mongoose-sequence')(mongoose);


const BuyerFinanceSchema = new mongoose.Schema({

    bf_id: { type: Number, unique: true },
    curdate: { type: String },
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },
    buyer_id: { type: Number, default: null, required: [true, "can't be blank"] },
    total_calls: { type: Number, default: 0 },
    price_per_call: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    qualified_calls: { type: Number, default: 0 },
    ef2: { type: String, default: null }


}, { timestamps: true });


//CampaignSchema.plugin(AutoIncrement, { inc_field: 'campaign_id' });

mongoose.model('Buyer_Finance', BuyerFinanceSchema);
