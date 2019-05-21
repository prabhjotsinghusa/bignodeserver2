var mongoose = require('mongoose');
const PublisherFinance = mongoose.model('Publisher_Finance');
// var BuyerFinance = mongoose.model('Buyer_Finance');
const BuyerNumbers = mongoose.model('Buyer_Number');
var AdminTransaction = mongoose.model('Admin_Transaction');
var Deduction = mongoose.model('Deduction');
var PaymentNotification = mongoose.model('Payment_Notification');
var Cdr = mongoose.model('Cdr');
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

var wallet = {};

wallet.getPublisherBalance = (req, res, next) => {
    let query = {
        did: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        pub_id: {
            $gt: 0
        },
        camp_id: {
            $gt: 0
        },
        status: 'show'
    };
    if (req.query.pub_id > 0) {
        query.pub_id = parseInt(req.query.pub_id);
    }
    //query.pub_id = 850;
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };

    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    function uniqueAll(arr, prop) {
        let a = [];
        return arr.filter(e => {
            if (a.indexOf(e.src) === -1) {
                a = [...a, e.src];
                return true;
            }
        });
    }

    function getData(data) {
        return new Promise((resolve, reject) => {
            const a = data.map(d => {
                const payable_calls = uniqueAll(d.payable_calls, 'src');
                d.payable_calls_length = payable_calls.length;
                d.payable_amount = 0;
                /* unique payable amount */
                //console.log(payable_calls,'payable_calls');
                payable_calls.map(pc => {
                    if (d.settings.charge_per_minute) {
                        d.payable_amount += pc.charge_per_minute * Math.ceil(pc.duration / 60);
                    } else {
                        d.payable_amount += pc.price_per_tfn;
                    }
                });
                return d;
            });
            resolve(a);
        });
    }
    return new Promise((resolve, reject) => {
        Cdr.aggregate([{
            $match: query
        },
        {
            '$lookup': {
                from: 'users',
                localField: 'pub_id',
                foreignField: 'uid',
                as: 'userdata'
            }
        },
        {
            '$lookup': {
                from: 'user_settings',
                localField: 'pub_id',
                foreignField: 'pub_id',
                as: 'settings'
            }
        },
        {
            '$lookup': {
                from: 'campaigns',
                localField: 'camp_id',
                foreignField: 'campaign_id',
                as: 'campaigndata'
            }
        },
        {
            '$project': {
                pub_id: 1,
                camp_id: 1,
                duration: 1,
                disposition: 1,
                src: 1,
                wallet: 1,
                price_per_tfn: 1,
                charge_per_minute: 1,
                publisher: {
                    '$arrayElemAt': ['$userdata', 0]
                },
                settings: {
                    '$arrayElemAt': ['$settings', 0]
                },
                campaign: {
                    '$arrayElemAt': ['$campaigndata', 0]
                },
                /* buffer_time: {
                    '$arrayElemAt': ['$campaigndata.buffer_time', 0]
                }, */
                buffer_time:1

            }
        },
        {
            $group: {
                _id: {
                    pub_id: '$pub_id',
                    camp_id: '$camp_id'
                },
                publisher: {
                    $first: '$publisher'
                },
                settings: {
                    $first: '$settings'
                },
                campaign: {
                    $first: '$campaign'
                },
                calls: {
                    $sum: 1
                },
                total_calls: {
                    $push: {
                        src: '$src',
                        disposition: '$disposition',
                        duration: '$duration',
                        buffer_time: '$buffer_time',
                        price_per_tfn: '$price_per_tfn',
                        charge_per_minute: '$charge_per_minute'
                    }
                },
                unique_calls: {
                    $addToSet: '$src'
                },
                answered_calls: { $addToSet: { $cond: [{ '$eq': ['$disposition', 'ANSWERED'] }, '$src', false] } },
                total_duration: {
                    $sum: '$duration'
                }
            }
        }, {
            $project: {
                publisher: 1,
                settings: 1,
                campaign: 1,
                total_calls: 1,
                unique_calls: 1,
                answered_calls: 1,
                payable_calls: {
                    $filter: {
                        input: '$total_calls',
                        as: 'call',
                        cond: {
                            $and: [{
                                $eq: ['$$call.disposition', 'ANSWERED']
                            }, {
                                $gt: ['$$call.duration', '$$call.buffer_time']
                            }]
                        }
                    }
                },
                total_duration: 1
            }
        }
        ]).then(async data => {
            const r = await getData(data)
            resolve(res.json({
                publisherFinance: r
            }));
        }).catch(next);

    });
}

/* Charge per Minute Publisher Balance */
wallet.getPublisherBalance2 = (req, res, next) => {

    let query = {
        did: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        pub_id: {
            $ne: 0
        },
        camp_id: {
            $ne: 0
        },
        status: 'show'
    };
    if (req.query.pub_id > 0) {
        query.pub_id = parseInt(req.query.pub_id);
    }
    //query.pub_id = 850;
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };

    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    let aggregateData = [{
        $match: query
    },
    {
        $group: {

            _id: {
                pub_id: "$pub_id",
                camp_id: "$camp_id"
            },
            duration: {
                $sum: "$duration"
            }
        }
    },
    {
        $lookup: {

            from: 'users',
            localField: "_id.pub_id",
            foreignField: 'uid',
            as: 'userdata'
        }
    },
    {
        $lookup: {

            from: 'user_settings',
            localField: "_id.pub_id",
            foreignField: 'pub_id',
            as: 'user_settingsdata'
        }
    },
    {
        $lookup: {
            from: 'campaigns',
            localField: "_id.camp_id",
            foreignField: 'campaign_id',
            as: 'campaigndata'
        }
    },

    {
        $project: {
            start: 1,
            duration: 1,
            campaigndata: {
                $arrayElemAt: ["$campaigndata", 0]
            },
            //userdata: { $arrayElemAt: ["$userdata", 0] },
            campaignName: {
                $arrayElemAt: ["$campaigndata.camp_name", 0]
            },
            publisherName: {
                $arrayElemAt: ["$userdata.fullname", 0]
            },
            user_charge_per_minute: {
                $arrayElemAt: ["$user_settingsdata.charge_per_minute", 0]
            }
        }

    },
    {
        $match: {
            user_charge_per_minute: 1 /* Enable Charge Per Minute for publisher */
        }
    },
    ];

    function getTotalMinute(cdr) {
        return new Promise((resolve, reject) => {
            let str = query;
            let buffer_time = 0;
            let charge_per_minute = 0;
            if (cdr.campaigndata !== undefined) {
                buffer_time = cdr.campaigndata.buffer_time;
                charge_per_minute = cdr.campaigndata.charge_per_minute;
            }

            async.parallel({
                payable: function (callback) {

                    str.camp_id = cdr['_id'].camp_id;
                    // console.log(str);
                    str.duration = {
                        $gt: buffer_time
                    };
                    return Cdr.aggregate([{
                        $match: str
                    },
                    {
                        $group: {
                            _id: '$did',
                            total: {
                                $sum: '$duration'
                            }
                        }
                    }, {
                        $project: {
                            _id: 1,
                            total: {
                                $ceil: {
                                    $divide: ['$total', 60]
                                }
                            },
                            total_amount: {
                                $multiply: [{
                                    $ceil: {
                                        $divide: ['$total', 60]
                                    }
                                }, charge_per_minute]
                            }
                        }
                    }
                    ]).then(data => {
                        return callback(null, data);
                    });
                }

            },
                function (err, results) {
                    //console.log(results, "+++++++++++++++++")
                    resolve(results);
                });
        });
    }


    function getData(cdrs) {

        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(

                cdrs.map(async (value) => { // map instead of forEach
                    //use loopDay as you wish
                    const result = await getTotalMinute(value);
                    const results = {
                        cdr: value,
                        d: result
                    };
                    return results; // important to return the value

                }));

            resolve(resolvedFinalArray);
        });
    }
    return new Promise((resolve, reject) => {

        Cdr.aggregate(aggregateData).then(async (data) => {
            if (!data) {
                resolve(res.sendStatus(422));
            }

            const results = await getData(data);
            resolve(res.json({
                publisherFinance: results
            }));

        }).catch(next);

    });
}

wallet.getPublisherBalanceTotal = (req, res, next) => {

    let query = {
        did: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        pub_id: {
            $ne: 0
        },
        camp_id: {
            $ne: 0
        },
        status: 'show'
    };
    if (req.query.pub_id > 0) {
        query.pub_id = parseInt(req.query.pub_id);
    }

    if (req.query.sdate == undefined && req.query.edate == undefined) {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else {

        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    let aggregateData = [

        {
            $match: query
        },
        {
            $group: {
                _id: {
                    pub_id: "$pub_id",
                    camp_id: "$camp_id"
                },
                duration: {
                    $sum: "$duration"
                }
            }
        },
        /*   {
              $lookup: {
                  from: 'users',
                  localField: "_id.pub_id",
                  foreignField: 'uid',
                  as: 'userdata'
              }
          }, */
        {
            $lookup: {
                from: 'campaigns',
                localField: "_id.camp_id",
                foreignField: 'campaign_id',
                as: 'campaigndata'
            }
        },
        {
            $project: {
                // start: 1,
                //  duration: 1,
                campaigndata: {
                    $arrayElemAt: ["$campaigndata", 0]
                },
                //userdata: { $arrayElemAt: ["$userdata", 0] },
                //campaignName: { $arrayElemAt: ["$campaigndata.camp_name", 0] },
                //publisherName: { $arrayElemAt: ["$userdata.fullname", 0] }
            }

        }
    ];

    function getTotalCalls(cdr) {

        return new Promise((resolve, reject) => {
            let str = query;
            let buffer_time = 0;
            let price_per_call = 0;
            if (cdr.campaigndata !== undefined) {
                buffer_time = cdr.campaigndata.buffer_time;
                price_per_call = cdr.campaigndata.price_per_call;
            }

            async.parallel({
                payablecalls: function (callback) {
                    str.camp_id = cdr['_id'].camp_id;
                    str.duration = {
                        $gte: buffer_time
                    };
                    return Cdr.distinct('src', str, function (err, result) {
                        return callback(null, result.length)
                    });
                },
                totalamount: function (callback) {
                    str.duration = {
                        $gte: buffer_time
                    };
                    return Cdr.distinct('src', str, function (err, result) {
                        return callback(null, (result.length * price_per_call))
                    });
                },

            },
                function (err, results) {
                    //console.log(results, "+++++++++++++++++")
                    resolve(results);
                });
        });
    }


    function getData(cdrs) {
        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(cdrs.map(async (value) => { // map instead of forEach
                //use loopDay as you wish
                const result = await getTotalCalls(value);
                const results = {
                    cdr: value,
                    d: result
                };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {

        Cdr.aggregate(aggregateData).then(async (data) => {
            if (!data) {
                resolve(res.sendStatus(422));
            }

            const results = await getData(data);
            resolve(res.json({
                publisherFinance: results
            }));

        }).catch(next);

    });
}

wallet.getSpecificPubBal = (req, res, next) => {
    const start_date = moment().startOf('month').format("YYYY-MM-DD 00:00:00");
    const end_date = moment().endOf('month').format("YYYY-MM-DD 23:59:59");

    let query = {
        did: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        camp_id: {
            $gt: 0
        },
        status: 'show',
        start: { $gte: start_date, $lte: end_date },
    };

    query.pub_id = parseInt(req.query.pub_id);

    let aggregateData = [{
        $match: query
    },
    { '$lookup': { from: 'user_settings', localField: 'pub_id', foreignField: 'pub_id', as: 'settings' } },
    { '$lookup': { from: 'campaigns', localField: 'camp_id', foreignField: 'campaign_id', as: 'campaigndata' } },
    {
        '$project': {
            pub_id: 1,
            camp_id: 1,
            duration: 1,
            disposition: 1,
            src: 1,
            price_per_tfn: 1,
            charge_per_minute: 1,
            settings: { '$arrayElemAt': ['$settings', 0] },
            campaigndata: { '$arrayElemAt': ['$campaigndata', 0] },
            // buffer_time: { '$arrayElemAt': ['$campaigndata.buffer_time', 0] },
            buffer_time : 1
        }
    },
    {
        $group: {
            _id: { pub_id: '$pub_id', camp_id: '$camp_id' },
            settings: { '$first': '$settings' },
            campaigndata: { $first: '$campaigndata' },
            total_calls: {
                $sum: 1
            },
            payable_calls: {
                $push: {
                    $cond:
                        [
                            { '$and': [{ '$eq': ['$disposition', 'ANSWERED'] }, { '$gt': ['$duration', '$buffer_time'] }] },
                            {
                                src: '$src', disposition: '$dispositon', duration: '$duration', price_per_tfn: '$price_per_tfn',
                                charge_per_minute: '$charge_per_minute', buffer_time: '$buffer_time'
                            }, false]
                }
            }
        }
    }];
    function uniqueAll(arr, prop) {
        let a = [];
        return arr.filter(e => {
            if (a.indexOf(e.src) === -1) {
                a = [...a, e.src];
                return true;
            }
        });
    }

    function getAmount(data) {
        return new Promise((resolve, reject) => {
            let b = 0;
            data.map(d => {
                const payable_calls = uniqueAll(d.payable_calls, 'src');
                /* unique payable amount */
                //console.log(payable_calls,'payable_calls');
                payable_calls.map(pc => {
                    if (d.settings.charge_per_minute) {
                        let a = parseInt(pc.charge_per_minute);
                        if (!isNaN(a)) {
                            b += a * Math.ceil(pc.duration / 60);
                        }
                    } else {
                        let a = parseInt(pc.price_per_tfn);
                        if (!isNaN(a)) {
                            b += a;
                        }
                    }
                });
            });
            console.log(b, 'total amount');
            resolve(b);
        });

    }


    function getTotalCalls() {
        return new Promise((resolve, reject) => {
            async.parallel({
                wallet_monthly: function (callback) {
                    return PublisherFinance.aggregate(
                        [{
                            $match: {
                                pub_id: parseInt(req.query.pub_id),
                                cron_status: 'complete'
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 1 }
                        ], function (err, result) {
                            if (err) console.log(err);
                            return callback(null, result);
                        });
                },
                totaldeduction: function (callback) {
                    return Deduction.aggregate([{
                        $match: {
                            pub_id: parseInt(req.query.pub_id),
                            deduction_date: { $gte: start_date, $lte: end_date },
                        }
                    },
                    {
                        $group: {
                            _id: "$pub_id",
                            count: {
                                $sum: 1
                            },
                            total: {
                                $sum: "$amount"
                            }
                        }
                    }], function (err, result) {
                        return callback(null, result)
                    });
                },
                totalpayment: function (callback) {
                    return AdminTransaction.aggregate([{
                        $match: {
                            pub_id: parseInt(req.query.pub_id),
                            payment_date: { $gte: start_date, $lte: end_date },
                        }
                    },
                    {
                        $group: {
                            _id: "$pub_id",
                            count: {
                                $sum: 1
                            },
                            total: {
                                $sum: "$amount"
                            }
                        }
                    }], function (err, result) {
                        return callback(null, result)
                    });
                }

            },
                function (err, results) {
                    //console.log(results, "+++++++++++++++++")
                    resolve(results);
                });
        });
    }

    Cdr.aggregate(aggregateData).then(async data => {
        const r = await getTotalCalls();
        r.total_amount = await getAmount(data);

        // r.total_payment = await totalpayment();
        return (res.json({
            publisherFinance: r
        }));
    });
}

wallet.getSpecificPubBal2 = (req, res, next) => {

    let query = {
        did: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        camp_id: {
            $ne: 0
        },
        status: 'show'
    };

    query.pub_id = parseInt(req.query.pub_id);

    let aggregateData = [{
        $match: query
    },
    {
        $group: {
            _id: {
                pub_id: "$pub_id",
                camp_id: "$camp_id"
            },
            duration: {
                $sum: "$duration"
            }
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: "_id.pub_id",
            foreignField: 'uid',
            as: 'userdata'
        }
    },
    {
        $lookup: {
            from: 'campaigns',
            localField: "_id.camp_id",
            foreignField: 'campaign_id',
            as: 'campaigndata'
        }
    },
    {
        $lookup: {
            from: 'user_settings',
            localField: "_id.pub_id",
            foreignField: 'pub_id',
            as: 'user_settingsdata'
        }
    },
    {
        $project: {
            start: 1,
            duration: 1,
            campaigndata: {
                $arrayElemAt: ["$campaigndata", 0]
            },
            //userdata: { $arrayElemAt: ["$userdata", 0] },
            campaignName: {
                $arrayElemAt: ["$campaigndata.camp_name", 0]
            },
            publisherName: {
                $arrayElemAt: ["$userdata.fullname", 0]
            },
            user_charge_per_minute: {
                $arrayElemAt: ["$user_settingsdata.charge_per_minute", 0]
            }
        }
    },
    {
        $match: {
            user_charge_per_minute: 1 /* Enable Charge Per Minute for publisher */
        }
    },
    ];

    function getTotalCalls(cdr) {
        return new Promise((resolve, reject) => {
            let str = query;
            let buffer_time = 0;
            if (cdr.campaigndata !== undefined) {
                buffer_time = cdr.campaigndata.buffer_time;
            }
            str.camp_id = cdr['_id'].camp_id;

            str.duration = {
                $gt: buffer_time
            };
            Cdr.find(str).then(data => {
                //  console.log("result", data)
                let sumduration = 0;
                data.map(d => {
                    sumduration += d.duration;
                });
                sumduration = Math.ceil(sumduration / 60);
                let totalll = 0;
                if (cdr.campaigndata !== undefined) {
                    totalll = (sumduration * cdr.campaigndata.charge_per_minute);
                }
                // console.log(charge_per_minute,'test',totalll);
                resolve({
                    total: sumduration,
                    total_amount: totalll
                });

            });
        });
    }

    function getData(cdrs) {

        return new Promise(async (resolve, reject) => {
            function totaldeduction() {
                return new Promise((resolve, reject) => {
                    Deduction.aggregate([{
                        $match: {
                            pub_id: parseInt(req.query.pub_id)
                        }
                    },
                    {
                        $group: {
                            _id: "$pub_id",
                            count: {
                                $sum: 1
                            },
                            total: {
                                $sum: "$amount"
                            }
                        }
                    }
                    ]).then(data => resolve(data));
                });
            }

            function totalpayment() {

                return new Promise((resolve, reject) => {
                    AdminTransaction.aggregate([{
                        $match: {
                            pub_id: parseInt(req.query.pub_id)
                        }
                    },
                    {
                        $group: {
                            _id: "$pub_id",
                            count: {
                                $sum: 1
                            },
                            total: {
                                $sum: "$amount"
                            }
                        }
                    }
                    ]).then(data => resolve(data));
                });
            }


            const totalde = await totaldeduction();
            const totalpa = await totalpayment();

            let resolvedFinalArray = await Promise.all(cdrs.map(async (value) => { // map instead of forEach
                //use loopDay as you wish
                const result = {};
                result.payable = await getTotalCalls(value);
                result.totaldeduction = totalde;
                result.totalpayment = totalpa;
                const results = {
                    cdr: value,
                    d: result
                };
                return results; // important to return the value


            }));

            resolve(resolvedFinalArray);
        });
    }
    return new Promise((resolve, reject) => {
        Cdr.aggregate(aggregateData).then(async (data) => {
            if (!data) {
                resolve(res.sendStatus(422));
            }

            const results = await getData(data);
            resolve(res.json({
                publisherFinance: results
            }));

        }).catch(next);
    });
}


wallet.getDeduction = (req, res, next) => {

    let query = {},
        sdate = '',
        ssdate = '',
        edate = '',
        eedate = '';

    if (req.query.pub_id > 0) {
        query.pub_id = parseInt(req.query.pub_id);
    }

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.deduction_date = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.deduction_date = {
            $gte: ssdate,
            $lte: eedate
        };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        query.deduction_date = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    let aggregateData = [{
        $match: query
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
        $project: {
            pub_id: 1,
            deduction_date: 1,
            amount: 1,
            remarks: 1,
            publisherName: {
                $arrayElemAt: ["$userdata.fullname", 0]
            }
        }

    }
    ];

    Deduction.aggregate(aggregateData).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            deduction: data
        });

    }).catch(next);

}
wallet.getPaidTransaction = (req, res, next) => {

    let query = {},
        sdate = '',
        ssdate = '',
        edate = '',
        eedate = '';

    if (req.query.pub_id > 0) {
        query.pub_id = parseInt(req.query.pub_id);
    }

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();

        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.payment_date = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.payment_date = {
            $gte: ssdate,
            $lte: eedate
        };
    } else {
        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        query.payment_date = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    let aggregateData = [{
        $match: query
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
        $project: {
            pub_id: 1,
            payment_date: 1,
            mode_payment: 1,
            amount: 1,
            remark: 1,
            publisherName: {
                $arrayElemAt: ["$userdata.fullname", 0]
            }
        }

    }
    ];

    AdminTransaction.aggregate(aggregateData).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            transaction: data
        });

    }).catch(next);

}
wallet.getBuyerBalance = (req, res, next) => {
    let query = {
        buyer_id: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        }
    },
        cdr = {},
        sdate = '',
        ssdate = '',
        edate = '';


    if (req.query.pub_id > 0) {
        query.pub_id = parseInt(req.query.pub_id);
    }
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else {

        sdat = parseInt(req.query.sdate);
        sdate = new Date(sdat);
        ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
        edat = parseInt(req.query.edate);
        edate = new Date(edat);
        eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
        query.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    //console.log(req.query,query,"+++++++++++++")
    let aggregateData = [{
        $match: query
    },
    {
        $group: {
            _id: {
                buyer_id: "$buyer_id",
                /// pub_id: "$pub_id"
            },
        }
    },
    {
        $lookup: {
            from: 'buyer_numbers',
            localField: "_id.buyer_id",
            foreignField: 'number',
            as: 'buyernumberdata'
        }
    },
    {
        $lookup: {
            from: 'buyers',
            localField: "buyernumberdata.buyer_id",
            foreignField: 'buyer_id',
            as: 'buyerdata'
        }
    },
    {
        $project: {
            start: 1,
            duration: 1,
            //userdata: { $arrayElemAt: ["$userdata", 0] },
            buyerdata: {
                $arrayElemAt: ["$buyerdata", 0]
            },
            buyerName: {
                $arrayElemAt: ["$buyerdata.name", 0]
            },
        }
    }];
    let BNS = [];
    BuyerNumbers.aggregate([
        { $match: { buyer_finance: 1 } },
        {
            $group: {
                _id: 'number',
                number: { $push: '$number' }
            }
        }
    ]).then(bn => {
        BNS = bn[0].number;
    });
    if (req.query.buyer_id > 0) {

        /* for specific buyer numbers buyer balance code */
        BuyerNumbers.find({
            buyer_id: parseInt(req.query.buyer_id)
        }, {
                number: 1
            }).then(data => {
                let numbers = data.map((val, i, arr) => {
                    return val.number;
                });

                query.buyer_id = {
                    $in: numbers
                };
                query.pub_id = 0;
                return new Promise((resolve, reject) => {
                    Cdr.aggregate(aggregateData).then(async (data) => {
                        if (!data) {
                            resolve(res.sendStatus(422));
                        }
                        d = filterData(data);
                        const results = await getData(d);
                        resolve(res.json({
                            buyerFinance: results
                        }));
                    }).catch(next);
                });
            }).catch(next);
    } else {
        return new Promise((resolve, reject) => {
            Cdr.aggregate(aggregateData).then(async (data) => {
                if (!data) {
                    resolve(res.sendStatus(422));
                }
                d = filterData(data);
                const results = await getData(d);
                resolve(res.json({
                    buyerFinance: results
                }));
            }).catch(next);
        });
    }

    function getTotalCalls(cdr) {
        return new Promise((resolve, reject) => {
            async.parallel({
                totalcalls: function (callback) {
                    //console.log(cdr,'cdr');
                    str.buyer_id = cdr['_id'].buyer_id;
                    return Cdr.find(str, function (err, result) {
                        if (!result) return 0;
                        return callback(null, result.length);
                    });
                },
                uniquecalls: function (callback) {
                    return Cdr.distinct('src', str, function (err, result) {
                        if (!result) return 0;
                        return callback(null, result.length);
                    });
                },
                payablecalls: function (callback) {
                    str.duration = {
                        $gte: cdr.buyerdata.buffer_time
                    };
                    return Cdr.distinct('src', str, function (err, result) {
                        if (!result) return 0;
                        return callback(null, result.length);
                    });
                },
                totalamount: function (callback) {
                    str.duration = {
                        $gte: cdr.buyerdata.buffer_time
                    };
                    return Cdr.distinct('src', str, function (err, result) {
                        if (!result) return 0;
                        console.log(price_per_call, 'buyer price');
                        return callback(null, (result.length * cdr.buyerdata.price_per_call));

                    });
                }

            },
                function (err, results) {
                    //console.log(results, "+++++++++++++++++")
                    resolve(results);
                });
        });
    }


    function getData(cdrs) {
        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(cdrs.map(async (value) => { // map instead of forEach
                //use loopDay as you wish
                str = query;
                cdr = value;
                buffer_time = 0;
                price_per_call = 0;
                // console.log(value, 'cdr');
                if (cdr.buyerdata != undefined) {

                    buffer_time = cdr.buyerdata.buffer_time;
                    price_per_call = cdr.buyerdata.price_per_call;
                }
                // const result = Promise.all([
                //     totalcalls(),
                //     uniquecalls(),
                //     payablecalls(),
                //     totalamount()
                // ])
                const result = await getTotalCalls(value);
                const results = {
                    cdr: value,
                    d: result
                };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }

    function filterData(data) {
        return data.filter(d => {
            const b = d['_id'].buyer_id + '';
            // console.log(b);
            if (b.indexOf('vm') === -1) {
                /* Internal routing array */
                /* // const BuyerNumbers = ['622', '627', '628', '631', '632', '635', '654321', '1234567', '178904977', '999999999', '1234567890', '33970735283', '18772398185', '33977553832', '33977559631', '33185157271', '33186610970', '19017549024', '33176240447', '18556225539', '33970170244', '33184800275', '33187666139', '33185159290', '33486804428', '33184805751', '33975128381', '33185153288', '33185157277', '33184804401', '33178904977', '30303030', '13252199248', '17603349790', '18889773981', '18442003917', '33184144526', '18883111094']; */
                if (BNS.indexOf(b) > -1) {
                    return true;
                }
            }
        });

    }


}

wallet.addPublishserBalance = (req, res, next) => {
    const options = {
        upsert: false,
        new: false
    };
    // console.log(req.body);
    req.body.publishers.forEach((pub, index) => {
        let transaction = new AdminTransaction();
        transaction.pub_id = pub.uid;
        transaction.mode_payment = req.body.mode || '';
        transaction.amount = parseInt(req.body.amount) || 0;
        transaction.remark = req.body.remarks || '';
        transaction.payment_date = req.body.paymentDate;
        transaction.save().then(data => {
            PaymentNotification.updateMany({
                pub_id: pub.uid,
                status: 1
            }, {
                    status: 0
                }, options).then(data2 => {
                    if (data2) {
                        res.json({
                            success: 'OK'
                        });
                    }
                }).catch(next);
        }).catch(next);
    });
}
wallet.deductPublishserBalance = (req, res, next) => {
    const options = {
        upsert: false,
        new: false
    };
    req.body.publishers.forEach((pub, index) => {
        let deduction = new Deduction();
        deduction.pub_id = pub.uid;

        deduction.amount = parseInt(req.body.amount) || 0;
        deduction.remarks = req.body.remarks || '';
        deduction.deduction_date = req.body.deductionDate;
        deduction.save().then(data => {
            if (index === req.body.publishers.length - 1) {
                res.json({
                    success: 'OK'
                });
            }

        }).catch(next);
    });
}
wallet.deleteTransaction = (req, res, next) => {

    AdminTransaction.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(req.params.id)
    }).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            success: 'OK',
            message: 'Transaction is removed successfully.'
        });
    }).catch(next);

}
wallet.deleteDeduction = (req, res, next) => {

    Deduction.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(req.params.id)
    }).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            success: 'OK',
            message: 'Deduction is removed successfully.'
        });
    }).catch(next);

}

module.exports = wallet;