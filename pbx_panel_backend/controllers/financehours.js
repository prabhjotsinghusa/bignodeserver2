var mongoose = require('mongoose');
var Cdr = mongoose.model('Cdr');
var FinanceHour = mongoose.model('FinanceHour');
var Manage_Group = mongoose.model('Manage_Group');
const db = require("../config/db"); //fetch mailing-configs from Utility module
var async = require("async");
var paginate = require("paginate");
const fs = require('fs');
const json2csv = require('json2csv').Parser;

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../Utilities/Utilities');

var financehours = {};

financehours.getFinanceHours = (req, res, next) => {

    const aggregateObj = [
        {
            $match: { pub_id: { $ne: 0 } }
        },
        {
            $lookup: {
                from: "users",
                localField: "pub_id",
                foreignField: "uid",
                as: "userData"
            }
        },
        {
            $unwind: "$userData"
        },
        {
            $project: {
                "fh_id": 1,
                "pub_id": 1,
                "publisherName": "$userData.fullname",
                "enable_from": 1,
                "enable_till": 1,
            }
        }
    ];

    FinanceHour.aggregate(aggregateObj).then((data) => {

        if (!data) {
            return res.sendStatus(422);
        } else {
            return res.json({ financeHour: data });
        }

    }).catch(next);


}

financehours.getFinanceHourById = (req, res, next) => {

    let paramsObj = {};

    if (req.params.fid) {
        paramsObj = { fh_id: parseInt(req.params.fid) }
    }

    const aggregateObj = [
        {
            $match: paramsObj
        },
        {
            $lookup: {
                from: "users",
                localField: "pub_id",
                foreignField: "uid",
                as: "userData"

            }
        },
        {
            $unwind: "$userData"

        },
        {
            $project: {
                "fh_id": 1,
                "pub_id": 1,
                "publisherName": "$userData.fullname",
                "enable_from": 1,
                "enable_till": 1,
            }
        }
    ];

    FinanceHour.aggregate(aggregateObj).then((data) => {

        if (!data) {
            return res.sendStatus(422);
        } else {
            return res.json({ financeHour: data });
        }
    }).catch(next);


}

financehours.addFinanceHours = (req, res, next) => {

    return new Promise((resolve, reject) => {
        let financeHour = new FinanceHour();

        financeHour.fh_id = req.body.pub_id,
            financeHour.pub_id = req.body.pub_id,
            financeHour.enable_from = req.body.enable_from,
            financeHour.enable_till = req.body.enable_till;

        financeHour.save().then((data, err) => {
            //create email verification tokenand update user data with the email verification token
            if (err) {
                reject(err);
            } else if (!data) {
                resolve(res.json({ success: 'NOK', message: 'Failed to add financeHours data.' }));
            } else {
                resolve(res.json({ financeHour: data }));
            }
        }).catch(next);
    });
}


financehours.editFinanceHours = (req, res, next) => {
    if (req.params.fid) {
        FinanceHour.findOne({ fh_id: req.params.fid }).then((data) => {
            if (!data) {
                return res.json({ success: 'NOK', message: 'Failed to update financeHours data.' });
            } else {
                let query = {
                    fh_id: req.params.fid
                },
                    update = {

                        fh_id: req.body.pub_id,
                        pub_id: req.body.pub_id,
                        enable_from: req.body.active_on,
                        enable_till: req.body.active_off
                    },
                    options = {
                        upsert: false,
                        new: true
                    };

                FinanceHour.findOneAndUpdate(query, update, options).then(data => {
                    return res.json({ financeHours: data });
                }).catch(next);
            }
        });
    } else {
        return res.json({ success: 'NOK', message: 'Finance Hours Id not found.' });
    }
}

financehours.deleteFinanceHour = (req, res, next) => {

    FinanceHour.deleteOne({ fh_id: req.params.fid }).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ success: 'OK', message: 'Finance hour is removed successfully.' });
    }).catch(next);

}



module.exports = financehours;
