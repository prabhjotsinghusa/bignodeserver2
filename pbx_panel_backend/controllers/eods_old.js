var mongoose = require('mongoose');
var Cdr = mongoose.model('Cdr');
var User = mongoose.model('User');
var Manage_Group = mongoose.model('Manage_Group');
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
        query = { gid: req.params.gid }
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
                resolve(res.json({ result: results }));
            }
        });
    });
}


eod.getCopy = async (req, res, next) => {

    let uidstr = {};
    let pubarr = [], copyData = [];

    function getAllCdrData(pub_id, price_per_tfn) {
        return new Promise((resolve, reject) => {

            let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' } };

            let agentstr = {};

            if (req.query.sdate == "" && req.query.edate == "") {

                sdat = parseInt(Date.now());
                sdate = new Date(sdat);
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                edat = parseInt(Date.now());
                edate = new Date(edat);
                eedate = moment(edate).format("YYYY-MM-DD 23:59:59");
                str.start = { $gte: ssdate, $lte: eedate };
            } else {
                sdat = parseInt(req.query.sdate);
                sdate = new Date(sdat);
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD HH:MM:SS");
                sssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD");
                edat = parseInt(req.query.edate);
                edate = new Date(edat);
                eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD HH:MM:SS");
                str.start = { $gte: ssdate, $lte: eedate };
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
                        return callback(null, { totalcalls: result.length })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.find(query, function (err, result) {
                        return callback(null, { totalanswered: result.length })
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
                                payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ], function (err, result) {
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

                const results = { publisher: value, result };
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
                resolve(res.json({ 'data': finalData, statusCode: 200 }));
            } else {
                resolve(res.json({ result: results }));
            }
        });
    });

}

/* eod.getPublishers = async (req, res, next) => {
    let uidstr = {};
    let pubarr = [];
    if (req.query.pub_id) {
        req.query.pub_id.forEach(pub_id => {
            pubarr.push(parseInt(pub_id));
        });
        uidstr = { status: "active", role: "publisher", uid: { $in: pubarr } };
        //uidstr={status: "active", role: "publisher", uid: 541};
    } else {
        uidstr = { status: "active", role: "publisher" };
    }

    if (req.query.fullname) {
        uidstr.fullname = { $regex: req.query.fullname, $options: 'i' }
    }

    function getAllCdrData(pub_id, price_per_tfn) {

        return new Promise((resolve, reject) => {

            let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' } };

            let agentstr = {};

            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
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
                        return callback(null, { totalcalls: result.length })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.find(query, function (err, result) {
                        return callback(null, { totalanswered: result.length })
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
                                payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ], function (err, result) {
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

                const results = { publisher: value, result };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }
    return new Promise((resolve, reject) => {
        User.find(uidstr, async (err, data) => {
            const skip = parseInt(req.query.page) * parseInt(req.query.limit);
            const [results, itemCount] = await Promise.all([
                User.find(uidstr).limit(parseInt(req.query.limit)).skip(skip).lean().exec(),
                User.count({})
            ]);
            const result = await getData(results);
            resolve(res.json({ data: result }));
        });
    });
} */
eod.getPublishers = async (req, res, next) => {

    let uidstr = {};
    let pubarr = [];
    if (req.query.pub_id) {
        req.query.pub_id.forEach(pub_id => {
            pubarr.push(parseInt(pub_id));
        });
        uidstr = { status: "active", role: "publisher", uid: { $in: pubarr } };
        //uidstr={status: "active", role: "publisher", uid: 541};
    } else {
        uidstr = { status: "active", role: "publisher" };
    }

    if (req.query.fullname) {
        uidstr.fullname = { $regex: req.query.fullname, $options: 'i' }
    }

    function getAllCdrData(pub_id, price_per_tfn) {

        return new Promise((resolve, reject) => {

            let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' } };

            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
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
                        return callback(null, { totalcalls: result.length })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.find(query, function (err, result) {
                        return callback(null, { totalanswered: result.length })
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
                                payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ], function (err, result) {
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
                console.log(value, 'in map loop');
                const result = await getAllCdrData(value.publisher.uid, value.publisher.price_per_tfn);

                const results = { publisher: value.publisher, result };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {
        let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }, pub_id: { $gt: 0 } };

        let sdate = new Date();
        if (req.query.selected_date) {
            sdate = new Date(parseInt(req.query.selected_date));
            ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
            str.start = { $gte: ssdate, $lte: eedate };
        } else {
            sdate = new Date();
            ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
            str.start = { $gte: ssdate, $lte: eedate };
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
            str.pub_id = { $in: pubarr };
        }
        /*  if (req.query.fullname) {
             uidstr.fullname = { $regex: req.query.fullname, $options: 'i' }
         } */

        const skip = parseInt(req.query.page) * parseInt(req.query.limit);
        Cdr.aggregate([
            {
                $match: str
            },
            {
                $group: {
                    _id: "$pub_id",
                    count: { $sum: 1 },
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
                $project: {
                    pub_id: '$_id',
                    publisher: { $arrayElemAt: ["$userdata", 0] },
                }
            }
        ]).then(async data => {
            const result = await getData(data);
            resolve(res.json({ data: result }));
        }).catch(next);
        /* User.find(uidstr, async (err, data) => {
            const skip = parseInt(req.query.page) * parseInt(req.query.limit);
            const [results, itemCount] = await Promise.all([
                User.find(uidstr).limit(parseInt(req.query.limit)).skip(skip).lean().exec(),
                User.count({})
            ]);
            const result = await getData(results);
            resolve(res.json({ data: result }));
        }); */
    });

}
eod.getPublishers2 = async (req, res, next) => {

    let uidstr = {};
    let pubarr = [];
    if (req.query.pub_id) {
        req.query.pub_id.forEach(pub_id => {
            pubarr.push(parseInt(pub_id));
        });
        uidstr = { status: "active", role: "publisher", uid: { $in: pubarr } };
        //uidstr={status: "active", role: "publisher", uid: 541};
    } else {
        uidstr = { status: "active", role: "publisher" };
    }

    if (req.query.fullname) {
        uidstr.fullname = { $regex: req.query.fullname, $options: 'i' }
    }

    function getAllCdrData(pub_id, price_per_tfn) {

        return new Promise((resolve, reject) => {

            let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' } };

            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
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
                        return callback(null, { totalcalls: result.length })
                    });
                },
                function (callback) {
                    let query = str;
                    query.disposition = 'ANSWERED';
                    return Cdr.find(query, function (err, result) {
                        return callback(null, { totalanswered: result.length })
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
                                payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ], function (err, result) {
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
                console.log(value, 'in map loop');
                const result = await getAllCdrData(value.publisher.uid, value.publisher.price_per_tfn);

                const results = { publisher: value.publisher, result };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {
        let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' }, pub_id: { $gt: 0 } };

        let sdate = new Date();
        if (req.query.selected_date) {
            sdate = new Date(parseInt(req.query.selected_date));
            ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
            str.start = { $gte: ssdate, $lte: eedate };
        } else {
            sdate = new Date();
            ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
            eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
            str.start = { $gte: ssdate, $lte: eedate };
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
            str.pub_id = { $in: pubarr };
        }
        /*  if (req.query.fullname) {
             uidstr.fullname = { $regex: req.query.fullname, $options: 'i' }
         } */

        const skip = parseInt(req.query.page) * parseInt(req.query.limit);
        Cdr.aggregate([
            {
                $match: str
            },
            {
                $group: {
                    _id: "$pub_id",
                    count: { $sum: 1 },
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
                $project: {
                    pub_id: '$_id',
                    publisher: { $arrayElemAt: ["$userdata", 0] },
                }
            }
        ]).then(async data => {
            const result = await getData(data);
            resolve(res.json({ data: result }));
        }).catch(next);
        /* User.find(uidstr, async (err, data) => {
            const skip = parseInt(req.query.page) * parseInt(req.query.limit);
            const [results, itemCount] = await Promise.all([
                User.find(uidstr).limit(parseInt(req.query.limit)).skip(skip).lean().exec(),
                User.count({})
            ]);
            const result = await getData(results);
            resolve(res.json({ data: result }));
        }); */
    });

}
eod.getAgents = (req, res, next) => {
    //console.log(req.query, "==========");

    function getAllCdrData(ext) {
        return new Promise((resolve, reject) => {

            console.log(ext, "in fuction getAllCdr")
            let str = { uniqueid: { $ne: 0 }, did: { $ne: '' }, lastapp: { $ne: 'Hangup' }, dst: { $ne: 's' } };

            let agentstr = {};
            let sdate = new Date();
            if (req.query.selected_date) {
                sdate = new Date(parseInt(req.query.selected_date));
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
            } else {
                sdate = new Date();
                ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
                eedate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 23:59.:59");
                str.start = { $gte: ssdate, $lte: eedate };
            }
            agentstr.curdate = { $gte: ssdate, $lte: eedate };

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
                        return callback(null, { totalcalls: result.length })
                    });
                },
                function (callback) {
                    // console.log(agentstr);
                    return AgentsTime.findOne(agentstr, function (err, result) {
                        return callback(null, { mins: result == null ? 0 : result.mins })
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
                                total: { $avg: "$duration" }
                            }
                        }, {
                            $group: {

                                _id: null,
                                unique_calls: { $sum: 1 },
                                aht: { $avg: '$total' }
                            }
                        }
                        ], function (err, result) {
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


    function getData(agents) {

        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(agents.map(async (value) => { // map instead of forEach

                const result = await getAllCdrData(value.extension);
                const results = { agent: value, result };
                return results; // important to return the value
            }));

            resolve(resolvedFinalArray);
        });
    }

    return new Promise((resolve, reject) => {

        let query = '';
        if (req.query.filterValue) {
            query = `SELECT * FROM asterisk.users WHERE name  like '%${req.query.filterValue}%'`;
        } else {
            query = "SELECT * FROM asterisk.users ";
        }


        if (req.query.page) {
            query += "LIMIT " + (parseInt(req.query.page) * parseInt(req.query.limit));
        }
        if (req.query.limit) {
            query += "," + req.query.limit;
        }

        db.query(query, async (err, data) => {
            if (err) {
                reject(err);
            } else if (data.length == 0) {
                resolve(null);
            } else {
                const results = await getData(data);
                resolve(res.json({ result: results }));
            }
        });
    }).catch(next);
}

eod.getTotalAgents = (req, res, next) => {
    return new Promise((resolve, reject) => {
        db.query("select count(*) as total from asterisk.users", async (err, data) => {
            if (err) {
                reject(err);
            } else if (data.length == 0) {
                resolve(null);
            } else {
                resolve(res.json({ agents: data[0].total }));
            }
        });
    }).catch(next);
}
module.exports = eod;