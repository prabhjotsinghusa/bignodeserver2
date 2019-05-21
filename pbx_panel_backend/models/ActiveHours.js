const mongoose = require('mongoose');

const ActiveHourSchema = new mongoose.Schema({
  
  day: { type: String, default: null },
  tfn:{ type: String, default: null ,required:true},
  destination: { type: String, default: null },
  active_on: { type: String, default: null }, /*only time in 13:30 format as string*/
  active_off: { type: String, default: null } /*only time in 13:30 format as string*/


}, { timestamps: false });



mongoose.model('Active_Hour', ActiveHourSchema);
