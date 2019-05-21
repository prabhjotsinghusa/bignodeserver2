const mongoose = require ('mongoose');

const BuyerNumberSchema = new mongoose.Schema({

    buyer_id: { type: Number, default: null, required: true },
    number: { type: String, default: null, required: true },
    status: { type: String, default: "unused" }, /*only time in 13:30 format as string*/
    limit: { type: Number, default: 0 } /*only time in 13:30 format as string*/
}, { timestamps: true });

module.exports = mongoose.model('Buyer_Number', BuyerNumberSchema);