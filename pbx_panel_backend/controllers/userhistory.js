const mongoose = require('mongoose');
const UserHistory = mongoose.model('User_History');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../Utilities/Utilities');

const userhistory = {};

userhistory.add = (req, res, next) => {
    if (req.body) {
        const history = new UserHistory();
        history.user = req.body.user;
        history.url = req.body.url;
        history.ip = req.connection.remoteAddress.replace('::ffff:', '') || ''
        history.save();
    }
    res.json({ success: 'OK' });
}

userhistory.find = (req, res, next) => {
    UserHistory.find().then(data => {
        res.json({ data: data });
    });
}

userhistory.delete = (req, res, next) => {
    console.log(req.query);
    UserHistory.deleteOne({ _id: req.query.id }).then(data => {
        res.json({ data: data });
    })
}
userhistory.deleteAll = (req, res, next) => {
    UserHistory.deleteMany({}).then(data => {
        res.json({ data: data });
    })
}
module.exports = userhistory;