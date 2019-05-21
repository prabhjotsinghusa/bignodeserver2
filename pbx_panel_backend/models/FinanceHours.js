const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const db = require('../config/db');

const FinanceHourSchema = new mongoose.Schema({

    fh_id: { type: Number, default: 0 },
    pub_id: { type: Number, default: 0 },
    enable_from: { type: String, default: null },
    enable_till: { type: String, default: null }


}, { timestamps: false });

mongoose.model('FinanceHour', FinanceHourSchema);
