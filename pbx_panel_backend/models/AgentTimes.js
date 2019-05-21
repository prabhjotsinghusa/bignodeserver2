const mongoose = require('mongoose');


const AgentsTimeSchema = new mongoose.Schema({
    curdate: {type:String, default: null},
    agent:{type:String,default:null},
    mins:{type:Number,default:null},
   }, { timestamps: true });

// TfnSchema.plugin(uniqueValidator, { message: 'is already taken.' });



mongoose.model('Agents_Time', AgentsTimeSchema);
