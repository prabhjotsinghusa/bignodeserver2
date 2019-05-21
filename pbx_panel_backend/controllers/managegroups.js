var mongoose = require('mongoose');
var Manage_Group = mongoose.model('Manage_Group');


const {

    getNextSequenceValue,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../Utilities/Utilities');


var groups = {};

groups.getAll = (req, res, next) => {

    let queryObj = {}

    if (req.params.gid) {
        queryObj = { gid: parseInt(req.params.gid) }
    }

    console.log(queryObj);
    Manage_Group.find(queryObj).then(function (data) {

        if (!data) { return res.sendStatus(422); }

        return res.json({ groups: data });
    }).catch(next);
}
groups.addGroup = (req, res, next) => {

    let group = new Manage_Group();

    group.name = req.body.name;
    group.publishers = req.body.publishers;

    console.log(req.body, "check body");

    group.save().then(data => { //create email verification tokenand update user data with the email verification token

        return res.json({ group: data });


    }).catch(next);

}
groups.editGroup = (req, res, next) => {

    if (req.params) {

        Manage_Group.findOne({ gid: req.params.gid }).then(group => {
            group.name = req.body.name;
            group.status = req.body.status;
            group.publishers = req.body.publishers;

            group.save().then(data => {
                return res.json({group:data});
            }).catch(next);

        });
    }
}
groups.deleteGroup = (req, res, next) => {

    Manage_Group.deleteOne({ gid: req.params.gid }).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({statusCode:200,message: "Group deleted successfully!"});
    
    }).catch(next);
}
module.exports = groups;
