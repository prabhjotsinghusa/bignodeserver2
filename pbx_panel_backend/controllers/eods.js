var mongoose = require('mongoose');
var Cdr = mongoose.model('Cdr');
var User = mongoose.model('User');
var Manage_Group = mongoose.model('Manage_Group');
const BuyerNumbers = mongoose.model('Buyer_Number');
const db = require("../config/db"); //fetch mailing-configs from Utility module
var async = require("async");
var AgentsTime = mongoose.model('Agents_Time');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../Utilities/Utilities');

var eod = {};


eod.getGroups = (req, res, next) => {
    let query = {};
    if (req.params.gid) {
        query = {
            gid: req.params.gid
        }
    }
    return new Promise((resolve, reject) => {
        Manage_Group.find(query, async (err, data) => {
            //console.log(data);
            if (err) {
                reject(err);
            } else if (data.length == 0) {
                resolve(null);
            } else {
                let results = data;
                resolve(res.json({
                    result: results
                }));
            }
        });
    });
}


eod.getCopy = async (req, res, next) => {

    let uidstr = {};
    let pubarr = [],
        copyData = [];

    function getAllCdrData(pub_id, price_per_tfn) {
        return new Promise((resolve, reject) => {

            let str = {
                uniqueid: {
                    $ne: 0
                },
                did: {
                    $ne: ''
                },
                lastapp: {
                    $ne: 'Hangup'
                },
                dst: {
                    $ne: 's'
                }
            };

            let agentstr = {};

            if (req.query.sdate == "" && req.query.edate == "") {

                sdat = parseInt(Date.now());
                sdate = new Date(sdat);
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                edat = parseInt(Date.now());
                edate = new Date(edat);
                eedate = moment(edate).format("YYYY-MM-DD 23:59:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            } else {
                sdat = parseInt(req.query.sdate);
                sdate = new Date(sdat);
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD HH:MM:SS");
                sssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD");
                edat = parseInt(req.query.edate);
                edate = new Date(edat);
                eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD HH:MM:SS");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            }

            if (pub_id) {
                str.pub_id = pub_id;
            }

            if (req.query.buyer_id) {
                str.buyer_id = req.query.buyer_id;
            }

            if (req.query.camp_id) {
                str.camp_id = req.query.camp_id;
            }

            if (req.query.did) {
                str.did = req.query.did;
            }

            if (req.query.status) {
                str.status = req.query.status;
            }

            async.parallel([
                function (callback) {
                    return Cdr.find(str, function (err, result) {
                        return callback(null, {
                            totalcalls: result.length
                        })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.find(query, function (err, result) {
                        return callback(null, {
                            totalanswered: result.length
                        })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';

                    return Cdr.aggregate(
                        [{
                            $match: query
                        }, {
                            $group: {
                                _id: '$src',
                                total: {
                                    $avg: "$duration"
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                unique_calls: {
                                    $sum: 1
                                },
                                aht: {
                                    $avg: '$total'
                                },
                            }
                        },
                        {
                            $project: {
                                unique_calls: 1,
                                aht: 1,
                                total: 1,
                                payableamount: {
                                    $multiply: ["$unique_calls", price_per_tfn]
                                },
                            }
                        }
                        ],
                        function (err, result) {
                            return callback(null, result)
                        });
                }
            ],
                function (err, results) {
                    //console.log(results,"+++++++++++++++++")
                    resolve(results);
                });

        });
    }


    function getData(publisher) {

        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(publisher.map(async (value) => { // map instead of forEach

                const result = await getAllCdrData(value.uid, value.price_per_tfn);

                const results = {
                    publisher: value,
                    result
                };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }

    function copyResultData(result) {

        return new Promise(async (resolve, reject) => {
            result.forEach(value => {
                copyData.push({
                    'FULLNAME': value.publisher.fullname,
                    'TOTAL CALLS': value.result[0].totalcalls,
                    'UNIQUE CALLS': value.result[2].length == 0 ? 0 : value.result[2][0].unique_calls,
                    'TOTAL ANSWERED CALLS': value.result[1].totalanswered,
                    'AHT': value.result[2].length == 0 ? 0 : value.result[2][0].aht,
                    'TOTAL PAYABLE CALLS': value.result[2].length == 0 ? 0 : value.result[2][0].payableamount
                })
            });

            resolve(copyData);
        });
    }

    return new Promise((resolve, reject) => {
        User.find(uidstr, async (err, data) => {
            const [results, itemCount] = await Promise.all([

                User.find(uidstr).limit(100).exec(),
                User.count({})
            ]);
            const result = await getData(results);

            const finalData = await copyResultData(result);

            if (req.query.type == 'csv') {
                resolve(res.json({
                    'data': finalData,
                    statusCode: 200
                }));
            } else {
                resolve(res.json({
                    result: results
                }));
            }
        });
    });

}

eod.getPublishers = async (req, res, next) => {
    let pubarr = [];
    function unique(arr, prop) {
        return arr.map(function (e) {
            return e[prop];
        }).filter(function (e, i, a) {
            return i === a.indexOf(e);
        });
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

                d.total_calls_length = d.total_calls.length;
                d.unique_calls_length = d.unique_calls.length;
                const answered_calls = uniqueAll(d.answered_calls, 'src');
                let aht = 0;
                answered_calls.map(pc => {
                    aht += pc.duration;
                });
                d.aht = Math.ceil((aht / 60) / answered_calls.length);
                d.answered_calls_length = answered_calls.length;
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

    function filterData(data) {
        let filterArray = [];
        data.map(d => {
            if (filterArray[d.publisher.uid] === undefined) {
                d.total = 1;
                d.tota_duration = d.tota_duration;
                filterArray[d.publisher.uid] = d;
            } else {

                let ob = filterArray[d.publisher.uid];
                ob.total_calls_length += d.total_calls.length;
                ob.unique_calls_length += d.unique_calls.length;
                const answered_calls = unique(d.answered_calls, 'src');
                ob.answered_calls_length += answered_calls.length;
                const payable_calls = unique(d.payable_calls, 'src');
                ob.payable_calls_length += payable_calls.length;
                ob.payable_amount += d.payable_amount;
                ob.aht += d.aht;
                ob.total += 1;
                d.tota_duration += d.tota_duration;
                filterArray[d.publisher.uid] = ob;
            }
        });
        const b = filterArray.filter(e => e !== undefined);
        return b;
    }

    return new Promise((resolve, reject) => {
        let str = {
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
            status: 'show'
        };

        let sdate = new Date();
        if (req.query.selected_date) {
            sdate = new Date(parseInt(req.query.selected_date));
            ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        } else {
            sdate = new Date();
            ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        }

        if (req.query.buyer_id) {
            str.buyer_id = req.query.buyer_id;
        }
        if (req.query.camp_id) {
            str.camp_id = req.query.camp_id;
        }
        if (req.query.did) {
            str.did = req.query.did;
        }
        if (req.query.status) {
            str.status = req.query.status;
        }
        if (req.query.pub_id) {
            req.query.pub_id.forEach(pub_id => {
                pubarr.push(parseInt(pub_id));
            });
            str.pub_id = {
                $in: pubarr
            };
        }

        Cdr.aggregate([{
            $match: str
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
                buffer_time: {
                    '$arrayElemAt': ['$campaigndata.buffer_time', 0]
                },

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

                total_duration: {
                    $sum: '$duration'
                }
            }
        }, {
            $project: {
                publisher: 1,
                settings: 1,
                total_calls: 1,
                unique_calls: 1,
                answered_calls: {
                    $filter: {
                        input: '$total_calls',
                        as: 'call',
                        cond: {
                            $eq: ['$$call.disposition', 'ANSWERED']
                        }
                    }
                },
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

            const r = await getData(data);
            // console.log(r,'outside loop');
            return r;
        }).then(data => {
            const r = filterData(data);

            resolve(res.json({
                data: r
            }));
        }).catch(next);
    });

}
eod.getPublishers_old = async (req, res, next) => {
    let pubarr = [];

    function getAllCdrData(pub_id, price_per_tfn, buffer_time, campaign_id) {
        return new Promise((resolve, reject) => {
            let str = {
                uniqueid: {
                    $ne: 0
                },
                did: {
                    $ne: ''
                },
                lastapp: {
                    $ne: 'Hangup'
                },
                dst: {
                    $ne: 's'
                }
            };

            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            }

            if (pub_id) {
                str.pub_id = pub_id;
            }

            if (req.query.buyer_id) {
                str.buyer_id = req.query.buyer_id;
            }

            //str.camp_id = campaign_id;


            if (req.query.did) {
                str.did = req.query.did;
            }

            if (req.query.status) {
                str.status = req.query.status;
            }

            async.parallel([
                function (callback) {
                    return Cdr.find(str, function (err, result) {
                        return callback(null, {
                            totalcalls: result.length
                        })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.find(query, function (err, result) {
                        return callback(null, {
                            totalanswered: result.length
                        })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    delete query.status;

                    return Cdr.aggregate(
                        [{
                            $match: query
                        }, {
                            $group: {
                                _id: '$src',
                                total: {
                                    $avg: "$duration"
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                unique_calls: {
                                    $sum: 1
                                },
                                aht: {
                                    $avg: '$total'
                                },
                            }
                        },
                        {
                            $project: {
                                unique_calls: 1,
                                aht: 1,
                                total: 1,
                            }
                        }
                        ],
                        function (err, result) {
                            return callback(null, result)
                        });
                },
                function (callback) {
                    let query2 = str;
                    query2.disposition = 'ANSWERED';
                    query2.duration = {
                        $gt: buffer_time
                    };
                    return Cdr.aggregate(
                        [{
                            $match: query2,
                        },
                        {
                            $match: {
                                status: 'show'
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    src: '$src'
                                },
                                campaignsdata: {
                                    $push: {
                                        camp_id: "$camp_id"
                                    }
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                payable_calls: {
                                    $sum: 1
                                },
                                campaignsdata: {
                                    $push: {
                                        $arrayElemAt: ["$campaignsdata.camp_id", 0]
                                    }
                                }
                                //  aht: { $avg: '$total' },
                            }
                        },
                        {
                            $lookup: {
                                from: 'campaigns',
                                localField: "campaignsdata",
                                foreignField: 'campaign_id',
                                as: 'campaignsdata'
                            }
                        },
                        {
                            $project: {
                                campaignsdata: {
                                    $arrayElemAt: ["$campaignsdata", 0]
                                },
                                payable_calls: 1,
                                payableamount: {
                                    '$multiply': ['$payable_calls', {
                                        $arrayElemAt: ["$campaignsdata.price_per_call", 0]
                                    }]
                                }
                            }
                        }
                        ],
                        function (err, result) {
                            delete query2;
                            return callback(null, result)
                        });
                }
            ],
                function (err, results) {
                    //console.log(results,"+++++++++++++++++")
                    resolve(results);
                });

        });
    }

    function getData(publisher) {
        return new Promise(async (resolve, reject) => {
            let resolvedFinalArray = await Promise.all(publisher.map(async (value) => { // map instead of forEach
                let result = [];
                if (value.publisher !== undefined) {
                    let buffer_time = campaign_id = 0;
                    if (value.campaign.buffer_time > 0) {
                        buffer_time = value.campaign.buffer_time;

                    }
                    result = await getAllCdrData(value.publisher.uid, value.publisher.price_per_tfn, buffer_time, campaign_id);
                    const results = {
                        publisher: value.publisher,
                        result
                    };
                    return results; // important to return the value
                }
            }));

            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {
        let str = {
            uniqueid: {
                $ne: 0
            },
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
            }
        };

        let sdate = new Date();
        if (req.query.selected_date) {
            sdate = new Date(parseInt(req.query.selected_date));
            ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        } else {
            sdate = new Date();
            ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        }

        if (req.query.buyer_id) {
            str.buyer_id = req.query.buyer_id;
        }
        if (req.query.camp_id) {
            str.camp_id = req.query.camp_id;
        }
        if (req.query.did) {
            str.did = req.query.did;
        }
        if (req.query.status) {
            str.status = req.query.status;
        }
        if (req.query.pub_id) {
            req.query.pub_id.forEach(pub_id => {
                pubarr.push(parseInt(pub_id));
            });
            str.pub_id = {
                $in: pubarr
            };
        }
        /*  if (req.query.fullname) {
             uidstr.fullname = { $regex: req.query.fullname, $options: 'i' }
         } */

        const skip = parseInt(req.query.page) * parseInt(req.query.limit);
        Cdr.aggregate([{
            $match: str
        },
        {
            $group: {
                _id: "$pub_id",
                count: {
                    $sum: 1
                },
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'uid',
                as: 'userdata'
            }
        },
        {
            $lookup: {
                from: 'user_settings',
                localField: '_id',
                foreignField: 'pub_id',
                as: 'settings'
            }
        },
        {
            $lookup: {
                from: 'campaigns',
                localField: 'camp_id',
                foreignField: 'campaign_id',
                as: 'campaigndata'
            }
        },
        {
            $project: {
                pub_id: '$_id',
                publisher: {
                    $arrayElemAt: ["$userdata", 0]
                },
                settings: {
                    $arrayElemAt: ["$settings", 0]
                },
                campaign: {
                    $arrayElemAt: ["$campaigndata", 0]
                }
            }
        }
        ]).then(async data => {
            const result = await getData(data);
            return result;
        }).then(data => {
            result = data.filter(e => e !== undefined);
            resolve(res.json({
                data: result
            }));
        }).catch(next);
    });

}
eod.getBuyers = async (req, res, next) => {
    let pubarr = [];

    function getAllCdrData(buyerNumber) {
        return new Promise((resolve, reject) => {
            let str = {
                lastapp: {
                    $ne: 'Hangup'
                },
                dst: {
                    $ne: 's'
                },
                buyer_id: buyerNumber.number
            };

            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            }

            if (req.query.buyer_id) {
                str.buyer_id = req.query.buyer_id;
            }

            if (req.query.did) {
                str.did = req.query.did;
            }

            async.parallel({
                total_calls: function (callback) {
                    return Cdr.countDocuments(str, function (err, result) {
                        return callback(null, result);
                    });
                },
                unique_calls: function (callback) {
                    return Cdr.distinct('src', str,
                        function (err, result) {
                            return callback(null, result.length);
                        });
                },
                answered_calls: function (callback) {
                    let query3 = str;
                    query3.disposition = 'ANSWERED';
                    return Cdr.distinct('src', query3,
                        function (err, result) {
                            delete query3;
                            return callback(null, result.length);
                        });
                },
                result: function (callback) {
                    let query2 = str;
                    query2.disposition = 'ANSWERED';
                    query2.duration = {
                        $gt: buyerNumber.buffer_time
                    };

                    return Cdr.aggregate(
                        [{
                            $match: query2,
                        },
                        {
                            $group: {
                                _id: {
                                    src: '$src'
                                },
                            }
                        }, {
                            $group: {
                                _id: null,
                                payable_calls: {
                                    $sum: 1
                                },

                            }
                        },
                        {
                            $project: {
                                payable_calls: 1,
                                payableamount: {
                                    '$multiply': ['$payable_calls', parseInt(buyerNumber.price_per_call)]
                                }
                            }
                        }
                        ],
                        function (err, result) {
                            // delete query2;
                            query2 = {};
                            return callback(null, result)
                        });
                }
            },
                function (err, results) {
                   // console.log(results,"+++++++++++++++++")
                    resolve(results);
                });

        });
    }

    function getData(buyerNumber) {
        return new Promise(async (resolve, reject) => {
            let resolvedFinalArray = await Promise.all(buyerNumber.map(async (value) => { // map instead of forEach
                let result = [];
                result = await getAllCdrData(value);
                const results = {
                    buyerNumber: value,
                    result
                };
                return results; // important to return the value

            }));

            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {

        BuyerNumbers.aggregate([{
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
                buyer_id: 1,
                number: 1,
                status: 1,
                buyerName: {
                    $arrayElemAt: ["$buyerdata.name", 0]
                },
                price_per_call: {
                    $arrayElemAt: ["$buyerdata.price_per_call", 0]
                },
                buffer_time: {
                    $arrayElemAt: ["$buyerdata.buffer_time", 0]
                }
            }
        }
        ]).then(async data => {
            const result = await getData(data);
            return result;
        }).then(data => {
            result = data.filter(e => e.result.total_calls > 0);
            resolve(res.json({
                data: result
            }));
        }).catch(next);
    });

}

eod.getTotalAgents = (req, res, next) => {
    return new Promise((resolve, reject) => {
        db.query("select count(*) as total from asterisk.users", async (err, data) => {
            if (err) {
                reject(err);
            } else if (data.length == 0) {
                resolve(null);
            } else {
                resolve(res.json({
                    agents: data[0].total
                }));
            }
        });
    }).catch(next);
}
eod.getPublishers2 = (req, res, next) => {
    function getAllCdrData(ext) {
        return new Promise((resolve, reject) => {
            let str = {
                uniqueid: {
                    $ne: 0
                },
                lastapp: {
                    $ne: 'Hangup'
                },
                dst: {
                    $ne: 's'
                }
            };

            let agentstr = {};
            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            }
            agentstr.curdate = {
                $gte: ssdate,
                $lte: eedate
            };

            if (req.query.pub_id) {
                str.pub_id = req.query.pub_id;
            }

            if (req.query.buyer_id) {
                str.buyer_id = req.query.buyer_id;
            }

            if (req.query.camp_id) {
                str.camp_id = req.query.camp_id;
            }

            if (req.query.did) {
                str.did = req.query.did;
            }

            if (ext) {
                str.dst = ext;
                agentstr.agent = ext;
            }

            if (req.query.status) {
                str.status = req.query.status;
            }
            async.parallel([
                function (callback) {
                    return Cdr.find(str, function (err, result) {
                        return callback(null, {
                            totalcalls: result.length
                        })
                    });
                },
                function (callback) {
                    // console.log(agentstr);
                    return AgentsTime.findOne(agentstr, function (err, result) {
                        return callback(null, {
                            mins: result == null ? 0 : result.mins
                        })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';

                    return Cdr.aggregate(
                        [{
                            $match: query
                        }, {
                            $group: {
                                _id: '$src',
                                total: {
                                    $avg: "$duration"
                                }
                            }
                        }, {
                            $group: {

                                _id: null,
                                unique_calls: {
                                    $sum: 1
                                },
                                aht: {
                                    $avg: '$total'
                                }
                            }
                        }],
                        function (err, result) {
                            return callback(null, result)
                        });
                }
            ],
                function (err, results) {
                    // console.log(results, "+++++++++++++++++")
                    resolve(results);
                });
        });
    }

    function getAgent(ext) {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM asterisk.users WHERE extension='${ext}'`;
            /*   if (req.query.page) {
                  query += "LIMIT " + (parseInt(req.query.page) * parseInt(req.query.limit));
              }
              if (req.query.limit) {
                  query += "," + req.query.limit;
              } */

            db.query(query, async (err, data) => {
                if (err) {
                    reject(err);
                } else if (data.length == 0) {
                    resolve(null);
                } else {
                    resolve(data[0]);
                }
            });
        })
    }

    function getData(agents) {
        return new Promise(async (resolve, reject) => {
            let resolvedFinalArray = await Promise.all(agents.map(async (value) => { // map instead of forEach
                const result = await getAllCdrData(value.dst);
                const agent = await getAgent(value.dst);
                const results = {
                    agent: agent,
                    cdr: value,
                    result
                };
                return results; // important to return the value
            }));
            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {
        let str = {
            uniqueid: {
                $ne: 0
            },
            lastapp: {
                $ne: 'Hangup'
            },
            $expr: {
                $eq: [{
                    $strLenCP: "$dst"
                }, 4]
            }
        };

        let sdate = new Date();
        if (req.query.selected_date) {
            sdate = new Date(parseInt(req.query.selected_date));
            ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        } else {
            sdate = new Date();
            ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        }
        if (req.query.buyer_id) {
            str.buyer_id = req.query.buyer_id;
        }
        if (req.query.camp_id) {
            str.camp_id = req.query.camp_id;
        }
        if (req.query.did) {
            str.did = req.query.did;
        }
        if (req.query.status) {
            str.status = req.query.status;
        }
        Cdr.aggregate([{
            $match: str
        },
        {
            $group: {
                _id: "$dst",
                count: {
                    $sum: 1
                },
            }
        },
        {
            $project: {
                dst: '$_id',
                count: 1,
            }
        }
        ]).then(async data => {

            const result = await getData(data);
            return result;
        }).then(data => {
            //result = data.filter(e => e !== undefined);
            resolve(res.json({
                data: data
            }));
        }).catch(next);
    }).catch(next);
}

eod.getAgents = (req, res, next) => {
    function getAllCdrData(ext) {
        return new Promise((resolve, reject) => {
            let str = {
                uniqueid: {
                    $ne: 0
                },
                lastapp: {
                    $ne: 'Hangup'
                },
                dst: {
                    $ne: 's'
                }
            };

            let agentstr = {};
            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };
            }
            agentstr.curdate = {
                $gte: ssdate,
                $lte: eedate
            };

            if (req.query.pub_id) {
                str.pub_id = req.query.pub_id;
            }

            if (req.query.buyer_id) {
                str.buyer_id = req.query.buyer_id;
            }

            if (req.query.camp_id) {
                str.camp_id = req.query.camp_id;
            }

            if (req.query.did) {
                str.did = req.query.did;
            }

            if (ext) {
                str.dst = ext;
                agentstr.agent = ext;
            }

            if (req.query.status) {
                str.status = req.query.status;
            }
            async.parallel([
                function (callback) {
                    return Cdr.find(str, function (err, result) {
                        return callback(null, {
                            totalcalls: result.length
                        })
                    });
                },
                function (callback) {
                    // console.log(agentstr);
                    return AgentsTime.findOne(agentstr, function (err, result) {
                        return callback(null, {
                            mins: result == null ? 0 : result.mins
                        })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';

                    return Cdr.aggregate(
                        [{
                            $match: query
                        }, {
                            $group: {
                                _id: '$src',
                                total: {
                                    $avg: "$duration"
                                }
                            }
                        }, {
                            $group: {

                                _id: null,
                                unique_calls: {
                                    $sum: 1
                                },
                                aht: {
                                    $avg: '$total'
                                }
                            }
                        }],
                        function (err, result) {
                            return callback(null, result)
                        });
                }
            ],
                function (err, results) {
                    // console.log(results, "+++++++++++++++++")
                    resolve(results);
                });
        });
    }

    function getAgent(ext) {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM asterisk.users WHERE extension='${ext}'`;
            /*   if (req.query.page) {
                  query += "LIMIT " + (parseInt(req.query.page) * parseInt(req.query.limit));
              }
              if (req.query.limit) {
                  query += "," + req.query.limit;
              } */

            db.query(query, async (err, data) => {
                if (err) {
                    reject(err);
                } else if (data.length == 0) {
                    resolve(null);
                } else {
                    resolve(data[0]);
                }
            });
        })
    }

    function getData(agents) {
        return new Promise(async (resolve, reject) => {
            let resolvedFinalArray = await Promise.all(agents.map(async (value) => { // map instead of forEach
                const result = await getAllCdrData(value.dst);
                const agent = await getAgent(value.dst);
                const results = {
                    agent: agent,
                    cdr: value,
                    result
                };
                return results; // important to return the value
            }));
            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {
        let str = {
            uniqueid: {
                $ne: 0
            },
            lastapp: {
                $ne: 'Hangup'
            },
            $expr: {
                $eq: [{
                    $strLenCP: "$dst"
                }, 4]
            }
        };

        let sdate = new Date();
        if (req.query.selected_date) {
            sdate = new Date(parseInt(req.query.selected_date));
            ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        } else {
            sdate = new Date();
            ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
            str.start = {
                $gte: ssdate,
                $lte: eedate
            };
        }
        if (req.query.buyer_id) {
            str.buyer_id = req.query.buyer_id;
        }
        if (req.query.camp_id) {
            str.camp_id = req.query.camp_id;
        }
        if (req.query.did) {
            str.did = req.query.did;
        }
        if (req.query.status) {
            str.status = req.query.status;
        }
        Cdr.aggregate([{
            $match: str
        },
        {
            $group: {
                _id: "$dst",
                count: {
                    $sum: 1
                },
            }
        },
        {
            $project: {
                dst: '$_id',
                count: 1,
            }
        }
        ]).then(async data => {

            const result = await getData(data);
            console.log(result);
            return result;
        }).then(data => {
            //result = data.filter(e => e !== undefined);
            resolve(res.json({
                data: data
            }));
        }).catch(next);
    }).catch(next);
}

module.exports = eod;