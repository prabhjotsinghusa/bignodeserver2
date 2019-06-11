const mongoose = require('mongoose');

const UserHistorySchema = new mongoose.Schema({
    user: { type: Object, required: true },
    ip: { type: String, default: '' },
    url: { type: String, default: '' },

}, { timestamps: true });

mongoose.model('User_History', UserHistorySchema);
