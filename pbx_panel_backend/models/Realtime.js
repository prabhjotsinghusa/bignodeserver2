const mongoose = require('mongoose');

const RealtimeSchema = new mongoose.Schema({

    call_data: { type: String, default: null}
    
  }, { timestamps: true });

mongoose.model('Realtime_Calls', RealtimeSchema);
