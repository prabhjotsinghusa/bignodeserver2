const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ServerSchema = new mongoose.Schema({

    server_key: { type: String, unique: true },
    server_id: { type: Number },
    server_name: { type: String },
    ip: { type: String, unique: true },
    created_at: { type: Date },
    status: { type: String, default: 'active' },

}, { timestamps: true });

ServerSchema.plugin(AutoIncrement, { inc_field: 'server_id' });

mongoose.model('Server', ServerSchema);
