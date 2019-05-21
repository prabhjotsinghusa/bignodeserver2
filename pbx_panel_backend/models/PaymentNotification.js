const mongoose = require('mongoose');

const PaymentNotificationSchema = new mongoose.Schema({

    pub_id: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    transaction_id: {type: String, default: null}

}, { timestamps: true });

mongoose.model('Payment_Notification', PaymentNotificationSchema);
