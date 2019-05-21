const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const ManageGroupSchema = new mongoose.Schema({

    gid: { type: Number, unique: true, index: true },
   
    name: { type: String, default: null },
    status: { type: String, default: "active" },
    publishers : [{_id : false,uid : String, fullname : String}],
    //publishers: [{pub_id: {type: Number, default: null},fullname: {type: String, default: null}} ],
   
}, { timestamps: true });


ManageGroupSchema.plugin(AutoIncrement, { inc_field: 'gid' });

mongoose.model('Manage_Group', ManageGroupSchema);
