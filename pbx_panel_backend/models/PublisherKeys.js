const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const PublisherKeySchema = new mongoose.Schema({

    key: { type: String, unique: true},
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },
    isDeleted: { type: Boolean, default: false },


}, { timestamps: true });


//PublisherKeysSchema.plugin(AutoIncrement, { inc_field: 'campaign_id' });

mongoose.model('PublisherKey', PublisherKeySchema);
