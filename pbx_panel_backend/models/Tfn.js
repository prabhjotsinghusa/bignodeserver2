const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const db = require('../config/db');
const {
    serverCall
} = require('../Utilities/Utilities');

const TfnSchema = new mongoose.Schema({
    buyer_id: { type: Number, default: 0 },
    pub_id: { type: Number, default: 0 },
    tfn: { type: String, required: [true, "can`t be blank"], default: null, trim: true, unique: true },
    price_per_tfn: { type: Number, default: 0 },
    status: { type: String, default: 'active', trim: true },
    purchase_date: { type: String, default: null },
    charge_per_minute: { type: Number, default: 0 },
    server_ip: { type: String, default: '' }
}, { timestamps: false });

// TfnSchema.plugin(uniqueValidator, { message: 'is already taken.' });

TfnSchema.pre('save', function () {

    this.wasNew = this.isNew;

    // console.log("+++++++++", this.isNew);

});

/* for saving in the incoming asterisk table */
TfnSchema.post('save', function (tfndata, next) {
    if (this.wasNew) {
        let query = `INSERT INTO asterisk.incoming 
        (cidnum,extension,destination,privacyman,alertinfo,ringing,mohclass,description,grppre,delay_answer,pricid,pmmaxretries,pmminlength,reversal,rvolume)
        VALUES ('','`+ tfndata.tfn + `','app-blackhole,hangup,1','0','','','default','default','','0','','','','','0')`;
        // console.log(query, 'add tfn');
        db.query(query, (err, res) => {

            if (err) {
                console.log(err);
            };
            console.log(`tfn inserted asterisk`, res);

            next();
        });
    }
});

mongoose.model('Tfn', TfnSchema);
