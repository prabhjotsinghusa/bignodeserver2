var mongoose = require('mongoose');
var ActiveHour = mongoose.model('Active_Hour');
var User = mongoose.model('User');
var UserSettings = mongoose.model('User_Settings');
var AssignedPublishers = mongoose.model('Assigned_Publisher');


const {
    sendEmail,
    sendResetPasswordMail,
    contactUserMail

} = require("../config/mailing"); //fetch mailing-configs from Utility module

const db = require("../config/db"); //fetch mailing-configs from Utility module

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../Utilities/Utilities');

var activeHours = {};


activeHours.getActiveHour = (req, res, next) => {

    let query = {};
    if (req.params.id) {
        query = { _id: mongoose.Types.ObjectId(req.params.id) };
    } else {
        query = {};
    }
    ActiveHour.find(query).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ activeHours: data });
    }).catch(next);

}


activeHours.deleteActiveHour = (req, res, next) => {

    ActiveHour.findByIdAndRemove({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ success: 'OK', message: 'Active hours removed successfully' });
    }).catch(next);

}

activeHours.addActiveHour = async (req, res, next) => {

    function fetchDestination() {

        return new Promise((resolve, reject) => {

            db.query("SELECT extension,destination FROM asterisk.incoming where (extension = ?)", req.body.tfn, (err, data) => {

                if (err) {

                    reject(err);
                }
                else if (data.length == 0) {
                    resolve(null);

                }
                else {
                    resolve(JSON.parse(JSON.stringify(data)));

                }
            });
        });
    }

    function checkForActiveHour(destinations) {

        return new Promise((resolve, reject) => {

            ActiveHour.findOne({ tfn: req.body.tfn }).then(data => { //create email verification tokenand update user data with the email verification token

                if (data) { return res.json({ success: 'NOK', message: 'TFN already exists in our records!' }) }

                resolve(destinations);

            }).catch(err => {

                reject(err);
            });
        });
    }

    function addActiveHour(dest) {

        return new Promise((resolve, reject) => {

            let activeHour = new ActiveHour();

            activeHour.day = req.body.day;
            activeHour.tfn = req.body.tfn;
            activeHour.destination = dest[0].destination;
            activeHour.active_on = req.body.active_on;
            activeHour.active_off = req.body.active_off;

            activeHour.save().then(data => { //create email verification tokenand update user data with the email verification token

                if (!data) { return res.sendStatus(422) }
                resolve(data);

            }).catch(err => {

                reject(err);
            });
        });
    }

    fetchDestination().then(data => {

        if (!data) {

            res.json({ success: 'NOK', message: 'TFN not exists in our records!' })

        } else {
            return checkForActiveHour(data);
        }

    }).then(data => {
        return addActiveHour(data);

    }).then(data => {

        return res.json({ activeHour: data });
    }).catch(err => {
        return res.sendStatus(422);
    })
}


activeHours.updateActiveHour = (req, res, next) => {

    let updateObj = {};

    if (req.body.day) {
        updateObj.day = req.body.day;
    }
    if (req.body.active_on) {
        updateObj.active_on = req.body.active_on;
    }
    if (req.body.active_off) {
        updateObj.active_off = req.body.active_off;
    }
    const query = {
        _id: mongoose.Types.ObjectId(req.params.id)
    },
        update = {
            $set: updateObj
        },
        options = {
            new: true,
            upsert: false
        }

    ActiveHour.findByIdAndUpdate(query, update, options).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ activeHour: data });
    }).catch(next);

}

module.exports = activeHours;
