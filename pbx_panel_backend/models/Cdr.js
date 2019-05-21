const mongoose = require('mongoose');


const CdrSchema = new mongoose.Schema({

    clid: { type: String, default: null},
    src: {type:String, default: null},
    dst:{type:String,default:null},
    dcontext:{type:String,default:null},
    channel:{type:String,default:null},
    dstchannel:{type:String,default:null},
    lastapp:{type:String,default:null},
    lastdata:{type:String,default:null},
    start:{type:String,default:null},
    answer: {type:String,default:null},
    end:{type:String,default:null},
    duration:{type:Number,default:null},
    billsec:{type:String,default:null},
    disposition:{type:String,default:null},
    amaflags:{type:String,default:null},
    accountcode:{type:String,default:null},
    uniqueid:{type:String,default:null},
    userfield:{type:String,default:null},
    sequence:{type:String,default:null},
    did:{type:String,default:null},
    oxygen_call_id:{type:String,default:null},
    pub_id:{type:Number,default:null},
    camp_id:{type:Number,default:null},
    buyer_id:{type:String,default:null},
    price_per_tfn:{type:Number,default:null},
    call_reducer:{type:Number,default:null},
    count:{type:Number,default:null},
    status:{type:String,default:null},
    recordingfile:{type:String, default:null},
    click_id:{type:String,default:null},
    charge_per_minute:{type:Number,default:0},
    wallet:{type:Number,default:0},
    wallet_status:{type:String,default:'no'},
    buffer_time:{type:String,default:null},
    concern:{type:String,default:''},
    remark:{type:String,default:''},
    buyerId:{type:String,default:''},
}, { timestamps: true });

// TfnSchema.plugin(uniqueValidator, { message: 'is already taken.' });



mongoose.model('Cdr', CdrSchema);
