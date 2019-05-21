const mongoose = require('mongoose');

const DeductionSchema = new mongoose.Schema({
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },   
    amount: { type: Number, default: 0 },
    deduction_date: { type: String, default: null },
    remarks: { type: String, default: null },
}, { timestamps: true });

mongoose.model('Deduction', DeductionSchema);
