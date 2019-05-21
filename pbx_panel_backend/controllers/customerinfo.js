var mongoose = require('mongoose');
var Cdr = mongoose.model('Cdr');
var CustomerInfo = mongoose.model('CustomerInfo');
var round = require('mongo-round');
var AgentsTime = mongoose.model('Agents_Time');
var Buyer = mongoose.model('Buyer');

const db = require("../config/db"); //fetch mailing-configs from Utility module
var async = require("async");

const {
    sendEmail,
    sendResetPasswordMail,
    contactUserMail

} = require("../config/mailing"); //fetch mailing-configs from Utility module

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../Utilities/Utilities');

var cdr = {};

cdr.addCustomerInfo = (req, res, next) => {
    
    var customerData={};
    if (req.body.agentid !== "") {
        customerData.agentid=req.body.agentid;

    }
    else if(req.body.customernumber !== ""){
        customerData.customernumber=req.body.customernumber;
    }   
    else if(req.body.concern !== ""){
        customerData.concern=req.body.concern;
    }
    else if(req.body.time !== ""){
        customerData.time=req.body.time;
    }
    CustomerInfo.save(customerData).then(data => {
            if (!data) {
                return res.sendStatus(422);
            }
            return res.json({ success: 'OK', data: data });
        }).catch(next);
    // } else {
    //     return res.json({ success: 'NOK' });
    // }
}

cdr.getAllCdrs = (req, res, next) => {
    let str = {
        did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    }
    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }
    /* for audit profile */
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
        }
        if (req.query.call_type === 'inbound') {
            str.did = { $ne: '' };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = { $in: JSON.parse(req.query.pubArr) };
            }
        }
    }

    /*buyer*/
    /* if (req.query.buyer_id) {
        str.buyer_id = parseInt(req.query.buyer_id);
    } */

    /*campaign*/
    if (req.query.camp_id) {
        str.camp_id = parseInt(req.query.camp_id);
    }
    /* DID */
    if (req.query.did) {
        str.did = req.query.did;
    }
    /* dest */
    if (req.query.dst) {
        str.dst = req.query.dst;
    }
    /* status */
    if (req.query.status) {
        str.status = req.query.status;
    }
    /* Buyer number query for buyer cdr */
    if (req.query.buyerNumber) {
        delete str.did;
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) };
    }

    Cdr.aggregate([
        {
            $match: str
        },
        {
            $lookup: {
                from: 'users',
                localField: 'pub_id',
                foreignField: 'uid',
                as: 'userdata'
            }
        },
        {
            $lookup: {
                from: 'buyers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyerdata'
            }
        },/* {
            $sort:{
                start:-1,
            }
        }, */
        {
            $project:
            {
                "clid": 1,
                "src": 1,
                "dst": 1,
                "dcontext": 1,
                "channel": 1,
                "dstchannel": 1,
                "lastapp": 1,
                "lastdata": 1,
                "start": 1,
                "answer": 1,
                "end": 1,
                "duration": 1,
                "billsec": 1,
                "disposition": 1,
                "amaflags": 1,
                "accountcode": 1,
                "uniqueid": 1,
                "userfield": 1,
                "sequence": 1,
                "did": 1,
                "oxygen_call_id": 1,
                "pub_id": 1,
                "camp_id": 1,
                "buyer_id": 1,
                "price_per_tfn": 1,
                "call_reducer": 1,
                "count": 1,
                "status": 1,
                "recordingfile": 1,
                publisherName: { $arrayElemAt: ["$userdata.fullname", 0] },
                buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                //,
                //campName: { $arrayElemAt: ["$campdata.camp_name", 0] }
            }
        }
    ]).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({ cdr: data, totalcalls: data.length });
    });
}

cdr.getTotalCalls = (req, res, next) => {
    let str = {
        did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    }

    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
        }
        if (req.query.call_type === 'inbound') {
            str.did = { $ne: '' };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = { $in: JSON.parse(req.query.pubArr) };
            }
        }
    }
    /*buyer*/
    /* if (req.query.buyer_id) {
        str.buyer_id = parseInt(req.query.buyer_id);
    } */

    /*campaign*/
    if (req.query.camp_id) {
        str.camp_id = parseInt(req.query.camp_id);
    }
    /* DID */
    if (req.query.did) {
        str.did = req.query.did;
    }
    /* dest */
    if (req.query.dst) {
        str.dst = req.query.dst;
    }
    /* status */
    if (req.query.status) {
        str.status = req.query.status;
    }

    /* Buyer number query for buyer cdr */
    if (req.query.buyerNumber) {
        delete str.did;
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) };
    }


    Cdr.find(str).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({ totalcalls: data.length });
    });
}

cdr.getTotalUniquieCalls = (req, res, next) => {
    let str = {
        did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    }
    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    /*buyer*/
    /* if (req.query.buyer_id) {
        str.buyer_id = parseInt(req.query.buyer_id);
    } */
    /* for audit profile */
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
        }
        if (req.query.call_type === 'inbound') {
            str.did = { $ne: '' };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = { $in: JSON.parse(req.query.pubArr) };
            }
        }
    }
    /*campaign*/
    if (req.query.camp_id) {
        str.camp_id = parseInt(req.query.camp_id);
    }
    /* DID */
    if (req.query.did) {
        str.did = req.query.did;
    }
    /* dest */
    if (req.query.dst) {
        str.dst = req.query.dst;
    }
    /* status */
    if (req.query.status) {
        str.status = req.query.status;
    }
    /* Buyer number query for buyer cdr */
    if (req.query.buyerNumber) {
        delete str.did;
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) };
    }

    Cdr.distinct('src', str).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ totalansweredcalls: data.length });
    }).catch(next);
}

cdr.getTotalUniqueAnsweredCalls = (req, res, next) => {
    let str = {
        // uniqueid: { $ne: 0 },
        did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }, disposition: { $eq: "ANSWERED" }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    }
    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    /*buyer*/
    /*  if (req.query.buyer_id) {
         str.buyer_id = parseInt(req.query.buyer_id);
     } */
    /* for audit profile */
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
        }
        if (req.query.call_type === 'inbound') {
            str.did = { $ne: '' };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = { $in: JSON.parse(req.query.pubArr) };
            }
        }
    }

    /*campaign*/
    if (req.query.camp_id) {
        str.camp_id = parseInt(req.query.camp_id);
    }
    /* DID */
    if (req.query.did) {
        str.did = req.query.did;
    }
    /* dest */
    if (req.query.dst) {
        str.dst = req.query.dst;
    }
    /* status */
    if (req.query.status) {
        str.status = req.query.status;
    }
    /* Buyer number query for buyer cdr */
    if (req.query.buyerNumber) {
        delete str.did;
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) };
    }

    Cdr.distinct('src', str).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ totaluniqueansweredcalls: data.length });
    }).catch(next);
}

cdr.getAHT = (req, res, next) => {
    let str = {

        did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }, disposition: { $eq: "ANSWERED" }
    };
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    }
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    /*buyer*/
    /*  if (req.query.buyer_id) {
         str.buyer_id = parseInt(req.query.buyer_id);
     } */
    /* for audit profile */
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
        }
        if (req.query.call_type === 'inbound') {
            str.did = { $ne: '' };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = { $in: JSON.parse(req.query.pubArr) };
            }
        }
    }
    /*campaign*/
    if (req.query.camp_id) {
        str.camp_id = parseInt(req.query.camp_id);
    }
    /* DID */
    if (req.query.did) {
        str.did = req.query.did;
    }
    /* dest */
    if (req.query.dst) {
        str.dst = req.query.dst;
    }
    /* status */
    if (req.query.status) {
        str.status = req.query.status;
    }
    /* Buyer number query for buyer cdr */
    if (req.query.buyerNumber) {
        delete str.did;
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) }
    }


    return Cdr.aggregate(
        [{
            $match: str
        }, {
            $group: {
                _id: '$src',
                total: { $avg: "$duration" }
            }
        }, {
            $group: {

                _id: null,
                // unique_calls: { $sum: 1 },
                aht: { $avg: '$total' }
            }
        }
        ], function (err, result) {
            return res.json({ aht: result });
        });
}

cdr.weeklyReport = (req, res, next) => {

    let str = {};

    // /*buyer*/
    // if (req.query.buyer_id) {
    //     str.buyer_id = parseInt(req.query.buyer_id);
    // }
    // /*campaign*/
    // if (req.query.camp_id) {
    //     str.camp_id = parseInt(req.query.camp_id);
    // }
    // /* DID */
    // if (req.query.did) {
    //     str.did = req.query.did;
    // }
    // /* dest */
    // if (req.query.dst) {
    //     str.dst = req.query.dst;
    // }
    // /* status */
    // if (req.query.status) {
    //     str.status = req.query.status;
    // }
    let weekdays = [];
    let totalcalls = [];
    let answeredcalls = [];
    let unique_calls = [];
    let aht = [];
    let data = [];

    function getAllCdrData(str) {

        return new Promise((resolve, reject) => {

            async.parallel({
                totalcalls: function (callback) {
                    return Cdr.countDocuments(str, function (err, result) {
                        return callback(null, result);
                    });
                },
                totalanswered: function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.countDocuments(query, function (err, result) {
                        return callback(null, result);
                    });
                },
                last: function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';

                    return Cdr.aggregate(
                        [{
                            $match: query
                        }, {
                            $group: {
                                _id: '$src',
                                total: { $avg: "$duration" }
                            }
                        }, {
                            $group: {
                                _id: null,
                                unique_calls: { $sum: 1 },
                                aht: { $avg: '$total' },
                            }
                        },
                        {
                            $project: {
                                unique_calls: 1,
                                aht: 1,
                                total: 1,
                                //payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ], function (err, result) {
                            return callback(null, result)
                        });
                }
            },
                function (err, results) {

                    // console.log(results, "+++++++++++++++++");
                    totalcalls = [...totalcalls, results.totalcalls];
                    answeredcalls = [...answeredcalls, results.totalanswered];
                    if (results.last[0] !== undefined) {
                        unique_calls = [...unique_calls, results.last[0].unique_calls];
                    } else {
                        unique_calls = [...unique_calls, 0];
                    }
                    if (results.last[0] !== undefined) {
                        aht = [...aht, Math.round(results.last[0].aht / 60)];
                    } else {
                        aht = [...aht, 0];
                    }
                    return resolve(results);
                });
        });
    }

    async function getData() {


        return new Promise(async(resolve,reject)=>{

            var curr = new Date; var first = curr.getDate() - curr.getDay();
            
            for (var i = 1; i < 7; i++) {

                str = {
                    did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }
                };
                var next = new Date(curr.getTime());
                next.setDate(first + i);
                ssdate = moment(next).format("YYYY-MM-DD");
                //console.log(next.toString());
                weekdays = [...weekdays, ssdate];
                ssdate = moment(next).format("YYYY-MM-DD 00:00:00");
                eedate = moment(next).format("YYYY-MM-DD 23:59:59");
                str.start = { $gte: ssdate, $lte: eedate };
    
                if (req.query.pub_id) {
                    str.pub_id = parseInt(req.query.pub_id);
                    str.status = 'show';
                }
                /* for audit profile */
                if (req.query.call_type) {
                    if (req.query.call_type === 'outbound') {

                        str.did = '';
                    }
                    if (req.query.call_type === 'inbound') {

                        str.did = { $ne: '' };
                    }
                    if (req.query.pub_id) {

                        str.pub_id = parseInt(req.query.pub_id);

                    } else {
                        if (req.query.pubArr) {

                            str.pub_id = { $in: JSON.parse(req.query.pubArr) };
                        }
                    }
                }
    
                data2 = await getAllCdrData(str);
                if (i >= 6) {
                    data = [
                        { data: totalcalls, label: 'Total Calls' },
                        { data: answeredcalls, label: 'Total Unique Calls' },
                        { data: unique_calls, label: 'Total Unique Answered Calls' },
                        { data: aht, label: 'AHT' }
                    ]
                    resolve(res.json({ weekly: { week: weekdays, data: data } }));
                }
            }
        });
       
    }

   
   // getData();
}

cdr.updateStatus = (req, res, next) => {
    
    if (req.params.id !== "") {
        Cdr.findByIdAndUpdate(req.params.id, { status: 'show' }, { upsert: false, new: false }).then(data => {
            if (!data) {
                return res.sendStatus(422);
            }
            return res.json({ success: 'OK', data: data });
        }).catch(next);
    } else {
        return res.json({ success: 'NOK' });
    }
}

cdr.getCustomerReport = (req, res, next) => {

    // ssdate = req.query.date + " 00:00:00";
    // eedate = req.query.date + " 23:59:59";
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");

    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
    }

    // console.log(req.query, ssdate, eedate, "==================");

    let csvArray = req.query.csvRecords.filter(value => {
        return value != 'customer_number' && value != ''
    });
    return new Promise((resolve, reject) => {

        // console.log(ssdate, "==============", eedate)

        Cdr.aggregate([
            {
                $match: {
                    "src": { $in: csvArray },
                    "start": { $gte: ssdate },
                    end: { $lte: eedate },
                    lastapp: { $ne: 'Hangup' },
                    dst: { $ne: 's' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'pub_id',
                    foreignField: 'uid',
                    as: 'userdata'
                }
            }
            ,
            {
                $project:
                {
                    did: 1,
                    "publisherName": {
                        "$cond": [
                            { "$eq": ["$userdata", []] },
                            "",
                            { $arrayElemAt: ["$userdata.fullname", 0] }
                        ]
                    },
                    src: 1
                }
            },
            {
                $group:
                {
                    _id: "$src",
                    publisherName: { $first: "$publisherName" },
                    src: { $first: "$src" },
                    did: { $first: "$did" }
                }
            }
        ]).then(result => {
            // console.log(result, "=====================")
            resolve(res.json({ "data": result }));
        }).catch(err => {
            reject(err);
        });;

    });
}


cdr.getUsageReport = (req, res, next) => {

    let str = {
        //uniqueid: { $ne: 0 },
        did: { $ne: '' }, lastapp: { $ne: 'Hangup' }
    };

    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    str.start = { $gte: req.query.sdate };
    str.end = { $lte: req.query.edate };
    //console.log(req.query, matchCond, "+++++++++++++++++++++++")

    return new Promise((resolve, reject) => {

        let query = [
            {
                $match: str
            },
            {
                $project: {
                    did: 1,
                    duration: round({ $divide: ['$duration', 60] }, 0)
                }

            },
            {
                $group: {
                    _id: '$did',
                    total: { $sum: "$duration" }
                }
            }
        ];

        Cdr.aggregate(query).then(data => {
            if (!data) { return res.sendStatus(422); }
            return res.json({ usageReport: data });
        }).catch(next);

    });
}

cdr.getBuyerReport = (req, res, next) => {
    let str = {
        uniqueid: { $ne: 0 },
        //did: { $ne: '' },
        lastapp: { $ne: 'Hangup' },
        dst: { $ne: 's' }
    };

    if (req.query.buyerNumber) {
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) };
    }

    sdat = parseInt(req.query.sdate);
    sdate = new Date(sdat);
    ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
    edat = parseInt(req.query.edate);
    edate = new Date(edat);
    eedate = moment(edate).format("YYYY-MM-DD 23:59:59");

    str.start = { $gte: ssdate, $lte: eedate };

    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    /*campaign*/
    if (req.query.camp_id) {
        str.camp_id = parseInt(req.query.camp_id);
    }
    /* DID */
    if (req.query.did) {
        str.did = req.query.did;
    }
    /* dest */
    if (req.query.dst) {
        str.dst = req.query.dst;
    }


    /* if (req.query.buyerNumber) {
        buyerMatch.buyerNumber = req.query.buyerNumber;
    } */
    console.log(str, "in api of getBuyerReport++++++++++++++++++");

    Cdr.aggregate([
        {
            $match: str
        },
        {
            $lookup: {

                from: 'buyer_numbers',
                localField: 'buyer_id',
                foreignField: 'number',
                as: 'buyerNumberdata'

            }
        },
        {
            $project:
            {
                //"clid": 1,
                "src": 1,
                "dst": 1,
                "start": 1,
                "answer": 1,
                "end": 1,
                "duration": 1,
                "date": {
                    $dateFromString: {
                        dateString: "$start"
                    }
                },
                "end": {
                    $dateFromString: {
                        dateString: "$end"
                    }
                },
                "disposition": 1,
                "did": 1,
                "pub_id": 1,
                "camp_id": 1,
                "buyer_id": 1,
                "status": 1,
                "buyerNumber": { $arrayElemAt: ["$buyerNumberdata.number", 0] }

            }
        },

        {
            $lookup: {
                from: 'users',
                localField: 'pub_id',
                foreignField: 'uid',
                as: 'userdata'
            }
        },
        /*  {
             $lookup: {
                 from: 'buyers',
                 localField: "$buyerNumberdata.buyer_id",
                 foreignField: 'buyer_id',
                 as: 'buyerdata'
             }
 
         }, */
        {
            $project:
            {

                "src": 1,
                "dst": 1,
                "start": 1,
                "answer": 1,
                "end": 1,
                "duration": 1,
                "date": {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$date"
                    }
                },
                "callstart": {
                    $dateToString: {
                        format: "%H:%M:%S", date: "$date"
                    }
                },
                "callend": {
                    $dateToString: {
                        format: "%H:%M:%S", date: "$end"
                    }
                },
                "disposition": 1,
                "did": 1,
                "pub_id": 1,
                "camp_id": 1,
                "buyer_id": 1,
                "status": 1,
                "publisherName": { $arrayElemAt: ["$userdata.fullname", 0] },
                // "buyerName": { $arrayElemAt: ["$buyerdata.name", 0] },
                "buyerNumber": 1
            }
        }
    ]).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({ buyerReport: data, totalcalls: data.length });
    });
}
cdr.buyerDashboard = (req, res, next) => {
    console.log("in buyerDashboard");

    let str = {

        uniqueid: { $ne: 0 },
        lastapp: { $ne: 'Hangup' },
        dst: { $ne: 's' }

    };

    if (req.query.buyerNumber) {
        str.buyer_id = { $in: JSON.parse(req.query.buyerNumber) };
    }

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        str.start = { $gte: ssdate, $lte: eedate };
    }

    function total_calls(buyer_number) {

        return new Promise((resolve, reject) => {
            let query = str;
            query.buyer_id = buyer_number;
            Cdr.countDocuments(query).then(data => {
                resolve(data);
            }).catch(next);
        });

    }

    function payable_calls(buyer_number,buffer_time) {

        return new Promise((resolve, reject) => {
            let query2 = str;
            query2.buyer_id = buyer_number;
            query2.duration = { $gt: buffer_time }
            Cdr.countDocuments(query2).then(data => {
                resolve(data);
            }).catch(next);
        })

    }

    function payable_amount(buyer_number,buffer_time,price_per_call) {

        return new Promise((resolve, reject) => {
            let query3 = str;
            query3.buyer_id = buyer_number;
            query3.duration = { $gt: buffer_time }

            return Cdr.aggregate([
                { $match: query3 },
                {
                    $group: {
                        _id: '$buyer_id',
                        count: { $sum: 1 },
                    }
                },
                {
                    $project: {
                        count: 1,
                        amount: { $multiply: ['$count', price_per_call] }
                    }
                }
            ]).then(data => {
                resolve(data)
            });
        })
    }

    function getData(data) {

        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(data[0].buyer_numbers.map(async (value) => { // map instead of forEach  

                const totalCalls = await total_calls(value.number);
                const payableCalls = await payable_calls(value.number,data[0].buffer_time);
                const payableAmount = await payable_amount(value.number,data[0].buffer_time, data[0].price_per_call);
                const results = {
                    number: value.number,
                    result: { totalCalls: totalCalls, payableCalls: payableCalls, payableAmount: payableAmount }
                };
                return results; // important to return the value
            }));
            resolve(resolvedFinalArray);
        });
    }

    Buyer.aggregate([
        { $match: { buyer_id: parseInt(req.query.buyer_id) } },
        {
            $lookup: {
                from: 'buyer_numbers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyer_numbers'
            },
        }
    ]).then(async data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({ buyerDashboard: await getData(data) });
    });
}

module.exports = cdr;
