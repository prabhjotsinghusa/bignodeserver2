var mongoose = require('mongoose');
var BuyerNumber = mongoose.model('Buyer_Number');
var User = mongoose.model('User');
var UserSettings = mongoose.model('User_Settings');
var AssignedPublishers = mongoose.model('Assigned_Publisher');
var mongoose = require('mongoose');

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

var buyerNumbers = {};


buyerNumbers.getAllBuyerNumbers = (req, res, next) => {

    let query = {};

    if (req.params.buyerId) {

        query = {
            buyer_id: req.params.buyerId
        };
    } else {
        query = {};
    }

    BuyerNumber.find(query).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            buyerNumber: data
        });
    }).catch(next);

}


buyerNumbers.deleteBuyerNumber = (req, res, next) => {

    BuyerNumber.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(req.params.id)
    }).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            success: 'OK',
            message: 'Buyer Number removed successfully'
        });

    }).catch(next);

}


buyerNumbers.addBuyerNumber = async (req, res, next) => {
    let buyerNumber = new BuyerNumber();

    buyerNumber.buyer_id = req.body.buyer_id;
    buyerNumber.number = req.body.number;

    buyerNumber.save().then(data => { //create email verification tokenand update user data with the email verification token

        if (!data) {
            return res.sendStatus(422)
        }
        return res.json({
            buyerNumber: data
        });

    }).catch(err => {
        return res.sendStatus(422);
    });
}


buyerNumbers.updateBuyerNumber = (req, res, next) => {

    let updateObj = {};

    if (req.body.status) {
        updateObj.status = req.body.status;
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

    BuyerNumber.findByIdAndUpdate(query, update, options).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            activeHour: data
        });
    }).catch(next);

}
buyerNumbers.getBuyerNumberSettings = (req, res, next) => {

    BuyerNumber.findById(req.params.id).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ buyer: data });
    }).catch(next);
}

buyerNumbers.updateBuyerNumberSettings = (req, res, next) => {

    let updateObj = {};
    console.log(req.body);
    updateObj.buyer_finance = req.body.display_wallet;
    updateObj.cdr = req.body.cdr_module;
    updateObj.realtime = req.body.realtime_module;
    updateObj.capping = req.body.capping_module;
    updateObj.buyer_finance = req.body.wallet_module;
    updateObj.monitoring = req.body.monitoring_module;
    updateObj.queue = req.body.queue_module;
    if (updateObj.queue) {
        updateObj.agents = req.body.agent;
    }


    const query = {
        _id: mongoose.Types.ObjectId(req.params.id)
    },
        update = {
            $set: updateObj
        },
        options = {
            new: false,
            upsert: false,
            override: true
        }

    BuyerNumber.findByIdAndUpdate(query, update, options).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            status: data
        });
    }).catch(next);


}

buyerNumbers.getBuyer = (req, res, next) => {
    BuyerNumber.aggregate([{
        $match: {
            number: req.query.number
        }
    },
    {
        $lookup: {
            from: 'buyers',
            localField: 'buyer_id',
            foreignField: 'buyer_id',
            as: 'buyerdata'
        }
    }, {
        $project: {
            number: 1,
            buyer_id: 1,
            buyerName: {
                $arrayElemAt: ["$buyerdata.name", 0]
            }
        }
    }
    ]).then(data => {
        //if (!data) { return res.sendStatus(422); }

        return res.json({
            data: data
        });
    }).catch(next);
}

buyerNumbers.getAll = (req, res, next) => {
    BuyerNumber.aggregate([{
        $match: {}
    },
    {
        $lookup: {
            from: 'buyers',
            localField: 'buyer_id',
            foreignField: 'buyer_id',
            as: 'buyerdata'
        }
    },
    {
        $project: {
            _id: 1,
            buyer_id: 1,
            number: 1,
            created_at: 1,
            status: 1,
            limit: 1,
            monitoring: 1,
            buyer_finance: 1,
            capping: 1,
            cdr: 1,
            realtime: 1,
            eod: 1,
            buyerdata: {
                $arrayElemAt: ["$buyerdata", 0]
            },
            buyerName: {
                $arrayElemAt: ["$buyerdata.name", 0]
            },
        }
    }

    ]).then(data => {
        if (!data) return res.sendStatus(422);
        return res.json({
            data: data
        });
    }).catch(next);
}


buyerNumbers.getBuyerDetails = (req, res, next) => {

    let paramsObj = {};

    if (req.params.buyerNumber) {
        paramsObj.number = req.params.buyerNumber;
    }


    BuyerNumber.aggregate([
        {

            $match: paramsObj

        },
        {
            $lookup: {
                from: 'buyers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyerdata'
            }
        },
        {
            $unwind:"$buyerdata"
        },
        {
            $project: {
                "buyer_id": 1,
                "status": 1,
                "limit": 1,
                "buyer_finance": 1,
                "capping": 1,
                "cdr": 1,
                "monitoring": 1,
                "queue": 1,
                "realtime": 1,
                "name": "$buyerdata.name",
                "password": "$buyerdata.password",
                "email": "$buyerdata.email",
                "contact": "$buyerdata.contact",
                "address": "$buyerdata.address",
                "price_per_call": "$buyerdata.price_per_call",
                "status": "$buyerdata.status",
                "created_at": "$buyerdata.created_at",
                "buffer_time": "$buyerdata.buffer_time",
                "pub_id": "$buyerdata.pub_id"

            }
        }
    ]).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ buyer: data });
    }).catch(next);
}


module.exports = buyerNumbers;