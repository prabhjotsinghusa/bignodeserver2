const mongoose = require('mongoose');

const AdminTransactionSchema = new mongoose.Schema({
    pub_id: { type: Number, default: null, required: [true, "can't be blank"] },
    mode_payment: { type: String, trim: true, default:null },
    amount: { type: Number, default: 0 },
    payment_date: { type: String, default: null },
    remark: { type: String, default: null },
}, { timestamps: true });

mongoose.model('Admin_Transaction', AdminTransactionSchema);
