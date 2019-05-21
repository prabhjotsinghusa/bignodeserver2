const mongoose = require('mongoose');

const RealtimestatusSchema = new mongoose.Schema({
  src: { type: String, default: null },
  dst: { type: String, default: null },
  camp_id: { type: String, default: null },
  pub_id: { type: String, default: null },
  count: { type: String, default: null },
  status: { type: String, default: null },

}, { timestamps: true });

mongoose.model('Realtime_Status', RealtimestatusSchema);
