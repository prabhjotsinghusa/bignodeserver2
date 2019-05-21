const mongoose = require('mongoose');

const BuyerNumberSchema = new mongoose.Schema({

    buyer_id: { type: Number, default: null, required: true },
    number: { type: String, default: null, required: true },
    status: { type: String, default: "unused" }, /*only time in 13:30 format as string*/
    limit: { type: Number, default: 0 }, /*only time in 13:30 format as string*/
    monitoring: { type: Number, default: 0 },
    buyer_finance: { type: Number, default: 0 },
    capping: { type: Number, default: 0 },
    cdr: { type: Number, default: 0 },
    realtime: { type: Number, default: 0 },
    eod: { type: Number, default: 0 },
    queue: { type: Number, default: 0 },
    agents:{type:String, default:''}
}, { timestamps: true });



mongoose.model('Buyer_Number', BuyerNumberSchema);
