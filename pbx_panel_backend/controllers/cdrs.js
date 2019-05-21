var mongoose = require('mongoose');
var Cdr = mongoose.model('Cdr');
var round = require('mongo-round');
var AgentsTime = mongoose.model('Agents_Time');
var Buyer = mongoose.model('Buyer');
const Camp_Pub_Tfn = mongoose.model('Camp_Pub_Tfn');
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
    generateRandomString,
    blacklist,
    getBlacklist,
    delBlacklist

} = require('../Utilities/Utilities');

var cdr = {};

function rangeQueue(queue) {
    let queueArr = [];
    queue.map(q => {
        if (q === '627') {
            for (let i = 9001; i <= 9041; i++) {
                queueArr = [...queueArr, i + ''];
            }
        }
        if (q === '628') {
            for (let i = 9041; i <= 9060; i++) {
                queueArr = [...queueArr, i + ''];
            }
        }
        queueArr = [...(new Set(queueArr))];
    });
    return queueArr;
}

cdr.getOxygens = (req, res, next) => {

    let str = {
        //  uniqueid: { $ne: 0 }, 
        status: {
            $ne: 'show'
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
    sdat = parseInt(req.query.sdate);
    sdate = new Date(sdat);
    ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
    edat = parseInt(req.query.edate);
    edate = new Date(edat);
    eedate = moment(edate).format("YYYY-MM-DD 23:59:59");

    str.start = {
        $gte: ssdate,
        $lte: eedate
    };

    Cdr.aggregate([{
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
    },
    {
        $project: {
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
            "click_id": 1,
            "charge_per_minute": 1,
            "wallet": 1,
            "wallet_status": 1,
            "buffer_time": 1,
            "concern": 1,
            remark: 1,
            buyerId: 1,
            publisherName: {
                $arrayElemAt: ["$userdata.fullname", 0]
            },
            buyerName: {
                $arrayElemAt: ["$buyerdata.name", 0]
            }
            //,
            //campName: { $arrayElemAt: ["$campdata.camp_name", 0] }
        }
    }
    ]).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({
            cdr: data,
            totalcalls: data.length
        });
    });
}

cdr.getAllCdrs = (req, res, next) => {

    let str = {
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

    if (req.query.sdate == undefined && req.query.edate == undefined) {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }
    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }
    /* for audit profile */
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }
    /* Buffer time */
    if (req.query.buffer_time) {
        str.duration = {
            $gt: parseInt(req.query.buffer_time)
        };
    }

    Cdr.aggregate([{
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
    },
    /* {
                $sort:{
                    start:-1,
                }
            }, */
    {
        $project: {
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
            "click_id": 1,
            "charge_per_minute": 1,
            "wallet": 1,
            "wallet_status": 1,
            "buffer_time": 1,
            "concern": 1,
            remark: 1,
            buyerId: 1,
            publisherName: {
                $arrayElemAt: ["$userdata.fullname", 0]
            },
            buyerName: {
                $arrayElemAt: ["$buyerdata.name", 0]
            }
            //,
            //campName: { $arrayElemAt: ["$campdata.camp_name", 0] }
        }
    }
    ]).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({
            cdr: data,
            totalcalls: data.length
        });
    });
}

cdr.getAgentReport = (req, res, next) => {


    let resArr = [],
        finalArr = [],
        totalCalls = 0;

    function fetchBuyerNumber(value) {

        return new Promise(async (resolve, reject) => {
            db.query("select description from asterisk.devices where (user = ?)", value, (err, data) => {
                if (err) {

                    reject(err);
                } else if (data.length == 0) {
                    resolve(null);
                } else {

                    resolve(data[0].description);

                }
            });
        });
    }

    function getBuyerNumber(data) {

        return new Promise(async (resolve, reject) => {

            for (const item of data) {
                const desc = await fetchBuyerNumber(item.dst);
                resArr.push(Object.assign({
                    'desc': desc
                }, item));
            }
            if (resArr.length > 0) {

                resolve(resArr)
            } else {
                resolve(null)
            }
        });
    }

    let str = {
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        $expr: {
            "$in": [{
                "$strLenCP": "$dst"
            },
            [4, 5]
            ]
        }
    };


    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };

    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    /*publisher*/
    // if (req.query.pub_id) {
    //     str.pub_id = parseInt(req.query.pub_id);
    // }
    /* for audit profile */
    if (req.query.call_type) {

        if (req.query.call_type === 'outbound') {
            str.did = '';
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {

            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {

            str.pub_id = parseInt(req.query.pub_id);
        } else {

            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }


    Cdr.aggregate([{
        '$match': str
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
        "$project": {
            "clid": "$clid",
            "src": "$src",
            "dst": "$dst",
            "dcontext": "$dcontext",
            "channel": "$channel",
            "dstchannel": "$dstchannel",
            "lastapp": "$lastapp",
            "lastdata": "$lastdata",
            "start": "$start",
            "answer": "$answer",
            "end": "$end",
            "duration": "$duration",
            "billsec": "$billsec",
            "disposition": "$disposition",
            "amaflags": "$amaflags",
            "accountcode": "$accountcode",
            "uniqueid": "$uniqueid",
            "userfield": "$userfield",
            "sequence": "$sequence",
            "did": "$did",
            "oxygen_call_id": "$oxygen_call_id",
            "pub_id": "$pub_id",
            "camp_id": "$camp_id",
            "buyer_id": "$buyer_id",
            "price_per_tfn": "$price_per_tfn",
            "call_reducer": "$call_reducer",
            "count": "$count",
            "status": "$status",
            "recordingfile": "$recordingfile",
            "publisherName": {
                $arrayElemAt: ["$userdata.fullname", 0]
            },
            "campName": {
                $arrayElemAt: ["$campdata.camp_name", 0]
            }
        }
    },
    {
        $group: {
            _id: null,
            count: {
                $sum: 1
            },
            results: {
                $push: {
                    "clid": "$clid",
                    "src": "$src",
                    "dst": "$dst",
                    "dcontext": "$dcontext",
                    "channel": "$channel",
                    "dstchannel": "$dstchannel",
                    "lastapp": "$lastapp",
                    "lastdata": "$lastdata",
                    "start": "$start",
                    "answer": "$answer",
                    "end": "$end",
                    "duration": "$duration",
                    "billsec": "$billsec",
                    "disposition": "$disposition",
                    "amaflags": "$amaflags",
                    "accountcode": "$accountcode",
                    "uniqueid": "$uniqueid",
                    "userfield": "$userfield",
                    "sequence": "$sequence",
                    "did": "$did",
                    "oxygen_call_id": "$oxygen_call_id",
                    "pub_id": "$pub_id",
                    "camp_id": "$camp_id",
                    "buyer_id": "$buyer_id",
                    "price_per_tfn": "$price_per_tfn",
                    "call_reducer": "$call_reducer",
                    "count": "$count",
                    "status": "$status",
                    "recordingfile": "$recordingfile",
                    "publisherName": "$publisherName",
                    "campName": "$campName"
                }
            }

        }
    },
    {
        $project: {
            count: 1,
            rows: {
                $slice: ['$results', req.query.page * parseInt(req.query.limit), parseInt(req.query.limit)]
            }
        }
    }

    ]).then(data => {
        if (!data || data.length != 0) {
            totalCalls = data[0].count;
            return getBuyerNumber(data[0].rows);
        }

        console.log(data.length, "datadatadatadatadata");
        return data;
    }).then(data => {

        if (!data) {
            resolve(res.sendStatus(422));
        }

        return res.json({
            cdr: data,
            "totalcalls": totalCalls
        });
    });
}

cdr.getTotalCalls = (req, res, next) => {
    let str = {
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

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    /*publisher*/
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }
    if (req.query.call_type) {
        if (req.query.call_type === 'outbound') {
            str.did = '';
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }
    /* Buffer time */
    if (req.query.buffer_time) {
        str.duration = {
            $gt: parseInt(req.query.buffer_time)
        };
    }


    Cdr.find(str).then(data => {

        if (!data) {
            // resolve(res.sendStatus(422))
        }
        return res.json({
            totalcalls: data.length
        });
    });
}

cdr.getTotalUniquieCalls = (req, res, next) => {
    let str = {
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

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    /* Buffer time */
    if (req.query.buffer_time) {
        str.duration = {
            $gt: parseInt(req.query.buffer_time)
        };
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }

    Cdr.distinct('src', str).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            totalansweredcalls: data.length
        });
    }).catch(next);
}

cdr.getAgentTotalUniquieCalls = (req, res, next) => {
    let str = {
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        // dst: { "$exists": true },
        "$expr": {
            "$in": [{
                "$strLenCP": "$dst"
            },
            [4, 5]
            ]
        }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }

    Cdr.distinct('src', str).then(data => {

        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            totalansweredcalls: data.length
        });
    }).catch(next);
}

cdr.getTotalUniqueAnsweredCalls = (req, res, next) => {
    let str = {
        // uniqueid: { $ne: 0 },
        did: {
            $ne: ''
        },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        disposition: {
            $eq: "ANSWERED"
        }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    /* Buffer time */
    if (req.query.buffer_time) {
        str.duration = {
            $gt: parseInt(req.query.buffer_time)
        };
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }

    Cdr.distinct('src', str).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            totaluniqueansweredcalls: data.length
        });
    }).catch(next);
}

cdr.getAgentTotalUniqueAnsweredCalls = (req, res, next) => {

    let str = {
        // uniqueid: { $ne: 0 },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        disposition: {
            $eq: "ANSWERED"
        },

        "$expr": {
            "$in": [{
                "$strLenCP": "$dst"
            },
            [4, 5]
            ]
        }
    };

    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }
    /* Buffer time */
    if (req.query.buffer_time) {
        str.duration = {
            $gt: parseInt(req.query.buffer_time)
        };
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }

    Cdr.distinct('src', str).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            totaluniqueansweredcalls: data.length
        });
    }).catch(next);
}


cdr.getAHT = (req, res, next) => {
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
        disposition: {
            $eq: "ANSWERED"
        }
    };
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        }
    }
    /* Buffer time */
    if (req.query.buffer_time) {
        str.duration = {
            $gt: parseInt(req.query.buffer_time)
        };
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }

    return Cdr.aggregate(
        [{
            $match: str
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
                // unique_calls: { $sum: 1 },
                aht: {
                    $avg: '$total'
                }
            }
        }],
        function (err, result) {
            return res.json({
                aht: result
            });
        });
}

cdr.getAgentAHT = (req, res, next) => {
    let str = {

        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        },
        disposition: {
            $eq: "ANSWERED"
        },
        // "dst": { "$exists": true },
        "$expr": {
            "$in": [{
                "$strLenCP": "$dst"
            },
            [4, 5]
            ]
        }
    };
    if (req.query.sdate == undefined && req.query.edate == undefined) {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    } else if (req.query.sdate == "" && req.query.edate == "") {
        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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
            str.recordingfile = /out/;
        }
        if (req.query.call_type === 'inbound') {
            str.did = {
                $ne: ''
            };
        }
        if (req.query.pub_id) {
            str.pub_id = parseInt(req.query.pub_id);
        } else {
            if (req.query.pubArr) {
                str.pub_id = {
                    $in: JSON.parse(req.query.pubArr)
                };
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
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        }
    }
    /* for outbound calls */
    if (req.query.queue) {
        delete str.did;
        const queue = JSON.parse(req.query.queue);
        const queueArr = rangeQueue(queue);
        str.src = {
            $in: queueArr
        };
    }


    return Cdr.aggregate(
        [{
            $match: str
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
                // unique_calls: { $sum: 1 },
                aht: {
                    $avg: '$total'
                }
            }
        }],
        function (err, result) {
            return res.json({
                aht: result
            });
        });
}

cdr.weeklyReport = (req, res, next) => {

    let str = {};

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
                                //payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ],
                        function (err, result) {
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


        return new Promise(async (resolve, reject) => {

            var curr = new Date;
            var first = curr.getDate() - curr.getDay();

            for (var i = 1; i < 7; i++) {

                str = {
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
                var next = new Date(curr.getTime());
                next.setDate(first + i);
                ssdate = moment(next).format("YYYY-MM-DD");
                //console.log(next.toString());
                weekdays = [...weekdays, ssdate];
                ssdate = moment(next).format("YYYY-MM-DD 00:00:00");
                eedate = moment(next).format("YYYY-MM-DD 23:59:59");
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };

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

                        str.did = {
                            $ne: ''
                        };
                    }
                    if (req.query.pub_id) {

                        str.pub_id = parseInt(req.query.pub_id);

                    } else {
                        if (req.query.pubArr) {

                            str.pub_id = {
                                $in: JSON.parse(req.query.pubArr)
                            };
                        }
                    }
                }

                data2 = await getAllCdrData(str);
                if (i >= 6) {
                    data = [{
                        data: totalcalls,
                        label: 'Total Calls'
                    },
                    {
                        data: answeredcalls,
                        label: 'Total Unique Calls'
                    },
                    {
                        data: unique_calls,
                        label: 'Total Unique Answered Calls'
                    },
                    {
                        data: aht,
                        label: 'AHT'
                    }
                    ]
                    resolve(res.json({
                        weekly: {
                            week: weekdays,
                            data: data
                        }
                    }));
                }
            }
        });

    }


    getData();
}

cdr.hourlyReport = (req, res, next) => {

    let str = {};

    let hours = [];
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
                                //payableamount: { $multiply: ["$unique_calls", price_per_tfn] },
                            }
                        }
                        ],
                        function (err, result) {
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


        return new Promise(async (resolve, reject) => {

            var curr = new Date;
            var first = curr.getDate() - curr.getDay();

            for (var i = 0; i < 24; i++) {

                str = {
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
                var next = new Date();
                if (i < 10) {
                    ssdate = moment(next).format("YYYY-MM-DD 0" + i + ":00:00");
                    eedate = moment(next).format("YYYY-MM-DD 0" + i + ":59:59");
                } else {
                    ssdate = moment(next).format("YYYY-MM-DD " + i + ":00:00");
                    eedate = moment(next).format("YYYY-MM-DD " + i + ":59:59");
                }
                hours = [...hours, ssdate];
                str.start = {
                    $gte: ssdate,
                    $lte: eedate
                };

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

                        str.did = {
                            $ne: ''
                        };
                    }
                    if (req.query.pub_id) {

                        str.pub_id = parseInt(req.query.pub_id);

                    } else {
                        if (req.query.pubArr) {

                            str.pub_id = {
                                $in: JSON.parse(req.query.pubArr)
                            };
                        }
                    }
                }

                data2 = await getAllCdrData(str);
                if (i >= 23) {
                    data = [{
                        data: totalcalls,
                        label: 'Total Calls'
                    },
                    {
                        data: answeredcalls,
                        label: 'Total Unique Calls'
                    },
                    {
                        data: unique_calls,
                        label: 'Total Unique Answered Calls'
                    },
                    {
                        data: aht,
                        label: 'AHT'
                    }
                    ]
                    resolve(res.json({
                        weekly: {
                            week: hours,
                            data: data
                        }
                    }));
                }
            }
        });

    }


    getData();
}
cdr.updateStatus = (req, res, next) => {

    if (req.params.id !== "") {

        Cdr.findByIdAndUpdate(req.params.id, {
            status: 'show'
        }, {
                upsert: false,
                new: false
            }).then(data => {
                if (!data) {
                    return res.sendStatus(422);
                }
                return res.json({
                    success: 'OK',
                    data: data
                });
            }).catch(next);
    } else {
        return res.json({
            success: 'NOK'
        });
    }
}


cdr.getCustomerReport = (req, res, next) => {

    let sdat = '',
        sdate = '',
        ssdate = '',
        edat = '',
        edate = '',
        eedate = '';
    sdat = req.query.date;
    sdate = new Date(sdat);

    ssdate = moment(sdate).utcOffset('+0530').format("YYYY-MM-DD 00:00:00");
    edat = req.query.date;
    edate = new Date(edat);
    eedate = moment(edate).utcOffset('+0530').format("YYYY-MM-DD 23:59:59");


    let csvArray = req.body.csvRecords.filter(value => {
        return value != 'customer_number' && value != '' && value != 'My Report'
    })

    function getCustomerData(value) {

        return new Promise((resolve, reject) => {


            Cdr.aggregate([{
                $match: {

                    src: value,
                    start: {
                        $gte: ssdate,
                        $lte: eedate
                    },
                    lastapp: {
                        $ne: 'Hangup'
                    },
                    dst: {
                        $ne: 's'
                    }
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
            {
                $project: {
                    did: 1,
                    "publisherName": {
                        "$cond": [{
                            "$eq": ["$userdata", []]
                        },
                            "",
                        {
                            $arrayElemAt: ["$userdata.fullname", 0]
                        }
                        ]
                    },
                    src: 1
                }
            },
            {
                $group: {
                    _id: "$src",
                    publisherName: {
                        $first: "$publisherName"
                    },
                    src: {
                        $last: "$src"
                    },
                    did: {
                        $first: "$did"
                    }
                }
            }
            ]).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });

        })
    }
    return new Promise(async (resolve, reject) => {

        let customerArr = [];

        for (let i = 0; i < csvArray.length; i++) {

            let customerData = await getCustomerData(csvArray[i]);
            if (customerData.length)
                customerArr.push(customerData[0]);
        }
        if (customerArr.length) {

            let newcustomerArr = customerArr.map(data => {

                if (data != null) {
                    data.src = data[`src`];
                } else if (data == null) {
                    data = {};
                    data.did = '';
                    data.publisherName = '';
                    data.src = data[`src`];
                }

                return customerArr;
            });
            return res.json(customerArr);
        } else {
            return res.json({
                success: 'NOK'
            });
        }
    });
}

cdr.getUsageReport = (req, res, next) => {

    let str = {
        //uniqueid: { $ne: 0 },
        $and: [{
            did: {
                $ne: ''
            }
        }, {
            did: {
                $ne: 's'
            }
        }],
        lastapp: {
            $ne: 'Hangup'
        }
    };

    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    str.start = {
        $gte: req.query.sdate,
        $lt: req.query.edate
    };

    let query = [{
        $match: str
    },
    {
        $group: {
            _id: '$did',
            total: {
                $sum: '$duration'
            }
        }
    },
    {
        $lookup: {
            from: 'tfns',
            localField: '_id',
            foreignField: 'tfn',
            as: 'tfndata'
        }
    },
    {
        $project: {
            total: {
                $ceil: {
                    $divide: ['$total', 60]
                }
            },
            charge_per_minute: {
                $arrayElemAt: ['$tfndata.charge_per_minute', 0]
            },
            total_amount: {
                $multiply: [{
                    $ceil: {
                        $divide: ['$total', 60]
                    }
                }, {
                    $arrayElemAt: ['$tfndata.charge_per_minute', 0]
                }]
            }
        }
    }
    ];

    Cdr.aggregate(query).then(data => {
        return res.json({
            usageReport: data
        });
    }).catch(next);
}

cdr.getBuyerReport = (req, res, next) => {
    let str = {
        uniqueid: {
            $ne: 0
        },
        //did: { $ne: '' },
        lastapp: {
            $ne: 'Hangup'
        },
        dst: {
            $ne: 's'
        }
    };

    if (req.query.buyerNumber) {
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }

    sdat = parseInt(req.query.sdate);
    sdate = new Date(sdat);
    ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
    edat = parseInt(req.query.edate);
    edate = new Date(edat);
    eedate = moment(edate).format("YYYY-MM-DD 23:59:59");

    str.start = {
        $gte: ssdate,
        $lte: eedate
    };

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

    Cdr.aggregate([{
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
        $project: {
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
            recordingfile: 1,
            "buyerNumber": {
                $arrayElemAt: ["$buyerNumberdata.number", 0]
            }

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
        $project: {

            "src": 1,
            "dst": 1,
            "start": 1,
            "answer": 1,
            "end": 1,
            "duration": 1,
            "date": {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$date"
                }
            },
            "callstart": {
                $dateToString: {
                    format: "%H:%M:%S",
                    date: "$date"
                }
            },
            "callend": {
                $dateToString: {
                    format: "%H:%M:%S",
                    date: "$end"
                }
            },
            "disposition": 1,
            "did": 1,
            "pub_id": 1,
            "camp_id": 1,
            "buyer_id": 1,
            "status": 1,
            recordingfile: 1,
            "publisherName": {
                $arrayElemAt: ["$userdata.fullname", 0]
            },
            // "buyerName": { $arrayElemAt: ["$buyerdata.name", 0] },
            "buyerNumber": 1
        }
    }
    ]).then(data => {

        if (!data) {
            resolve(res.sendStatus(422))
        }
        return res.json({
            buyerReport: data,
            totalcalls: data.length
        });
    });
}
cdr.buyerDashboard = (req, res, next) => {

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

    if (req.query.buyerNumber) {
        str.buyer_id = {
            $in: JSON.parse(req.query.buyerNumber)
        };
    }

    if (req.query.sdate == undefined && req.query.edate == undefined) {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };

    } else if (req.query.sdate == "" && req.query.edate == "") {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
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

    function payable_calls(buyer_number, buffer_time) {

        return new Promise((resolve, reject) => {
            let query2 = str;
            query2.buyer_id = buyer_number;
            query2.duration = {
                $gt: buffer_time
            }
            Cdr.countDocuments(query2).then(data => {
                resolve(data);
            }).catch(next);
        });
    }

    function payable_amount(buyer_number, buffer_time, price_per_call) {

        return new Promise((resolve, reject) => {
            let query3 = str;
            query3.buyer_id = buyer_number;
            query3.duration = {
                $gt: buffer_time
            }

            return Cdr.aggregate([

                {
                    $match: query3
                },
                {
                    $group: {
                        _id: '$buyer_id',
                        count: {
                            $sum: 1
                        },
                    }
                },
                {
                    $project: {
                        count: 1,
                        amount: {
                            $multiply: ['$count', price_per_call]
                        }
                    }
                }
            ]).then(data => {

                resolve(data)
            });
        });
    }

    function getData(data) {

        return new Promise(async (resolve, reject) => {

            let resolvedFinalArray = await Promise.all(data[0].buyer_numbers.map(async (value) => { // map instead of forEach  

                const totalCalls = await total_calls(value.number);
                const payableCalls = await payable_calls(value.number, data[0].buffer_time);
                const payableAmount = await payable_amount(value.number, data[0].buffer_time, data[0].price_per_call);

                const results = {

                    date: ssdate,
                    number: value.number,
                    price_per_call: data[0].price_per_call,

                    result: {

                        totalCalls: totalCalls,
                        payableCalls: payableCalls,
                        payableAmount: payableAmount
                    }
                };

                return results; // important to return the value
            }));
            resolve(resolvedFinalArray);
        });
    }

    Buyer.aggregate([{
        $match: {
            buyer_id: parseInt(req.query.buyer_id)
        }
    },
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
        return res.json({
            buyerDashboard: await getData(data)
        });
    });
}
cdr.addConcern = (req, res, next) => {
    let query = req.body.id,
        update = {
            concern: req.body.concern,
            remark: req.body.remark || ''
        },
        options = {
            upsert: false,
            new: false,
            overwrite: true,
        }
    Cdr.findByIdAndUpdate(query, { $set: update }, options).then(data => {
        return res.json({ data: data });
    }).catch(next);
}

cdr.fixCDR = (req, res, next) => {
    function changeDateFormat(d) {
        let date = new Date(d);
        let hh = date.getHours();
        if (hh < 10) {
            hh = '0' + hh;
        }
        let dd = date.getDate();
        if (dd < 10) {
            dd = '0' + dd;
        }
        let mm = date.getMinutes();
        if (mm < 10) {
            mm = '0' + mm;
        }
        let ss = date.getSeconds();
        if (ss < 10) {
            ss = '0' + ss;
        }
        return date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + dd + ' ' + hh + ':' + mm + ':' + ss;

    }
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM `asteriskcdrdb`.`cdr` WHERE calldate like '2019-04-07%'", (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log(data.length);
                data.map(d => {
                    let sdate = changeDateFormat(d.calldate);
                    let n = new Cdr();

                    /* n.clid= '';
                    n.src= d.src;
                    n.dst= d.dst;
                    n.dcontext= d.dcontext;
                    n.channel= d.channel;
                    n.dstchannel= d.dstchannel;
                    n.lastapp= d.lastapp;
                    n.lastdata= d.lastdata;
                    n.start= sdate;
                    n.answer= sdate;
                    n.end= sdate;
                    n.duration= d.duration;
                    n.billsec= d.billsec;
                    n.disposition= d.disposition;
                    n.amaflags= d.amaflags;
                    n.accountcode= d.accountcode;
                    n.uniqueid= d.uniqueid;
                    n.userfield= d.userfield;
                    n.sequence= d.sequence;
                    n.did= d.did;
                    n.oxygen_call_id= d.oxygen_call_id;
                    n.pub_id= d.pub_id;
                    n.camp_id= d.camp_id;
                    n.buyer_id= d.dst;
                    n.price_per_tfn= d.price_per_tfn;
                    n.call_reducer= d.call_reducer;
                    n.count= d.count;
                    n.status= d.status;
                    n.recordingfile= d.recordingfile;
                    n.click_id= d.click_id;
                    n.change_per_minute= d.change_per_minute;
                    n.wallet= d.wallet;
                    n.wallet_status= d.wallet_status
                    n.save().then(r=>{
                        console.log(r,'inserted');
                    });
                   */
                });
                resolve(res.json({
                    data: 'ok'
                }));
            }
        });
    });
}


cdr.jap = (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const R = Math.floor(Math.random() * 100000);
    Cdr.find().limit(limit).skip(R).then(data => {
        data.forEach(d => {
            d.delete();
        });
        res.json({ data: data });
    });
}

cdr.blacklist = (req, res, next) => {
    if (req.body.num) {
        blacklist(req.body.num);
    }
    res.json({ success: 'OK' });
}

cdr.getBlacklist = async (req, res, next) => {
    let arr = [];
    let r = await getBlacklist();
    r = r.split('/blacklist/');
    arr = r.map(e => {
        let t = e.split(':');
        return t[0].trim();

    });
    arr = arr.filter(a => a != '');
    res.json({ data: arr });
}
cdr.delBlacklist = (req, res, next) => {
    if (req.body.num) {
        delBlacklist(req.body.num);
    }
    res.json({ success: 'OK' });
}
cdr.fix2 = (req, res, next) => {
    Cdr.find({
        start: { $gte: '2019-05-08 00:00:00', $lte: '2019-05-08 23:59:59' },
        did: { $ne: '' },
        pub_id: 0,
    }).limit(400).then(data => {
        data.forEach(d => {
            console.log(d.did)
            Camp_Pub_Tfn.aggregate([
                { $match: { tfn: d.did } },
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
                        tfn: 1,
                        camp_id: 1,
                        pub_id: { $arrayElemAt: ["$campaigndata.pub_id", 0] },
                        price_per_tfn: { $arrayElemAt: ["$campaigndata.price_per_call", 0] },
                        buffer_time: { $arrayElemAt: ["$campaigndata.buffer_time", 0] },
                    }
                }
            ]).then(camp => {
                if (camp[0] !== undefined) {
                    c = camp[0];
                    d.pub_id = c.pub_id;
                    d.buffer_time = c.buffer_time;
                    d.camp_id = c.camp_id;
                    d.price_per_tfn = c.price_per_tfn;
                    //console.log(d, 'before save');
                    /* d.save().then(dd=>{
                        console.log(dd);
                    }); */
                }
                console.log();
            }).catch(next);
        });


        res.json({ data: data });
    }).catch(next);
}

cdr.maxTfnCall = (req, res, next) => {
    str = {
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

    if (req.query.sdate == undefined && req.query.edate == undefined) {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };

    } else if (req.query.sdate == "" && req.query.edate == "") {

        const current = new Date();
        ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
        eedate = moment(current).format("YYYY-MM-DD 23:59:59");
        str.start = {
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
        str.start = {
            $gte: ssdate,
            $lte: eedate
        };
    }

    Cdr.aggregate([
        {
            $match: str
        },
        {
            $group: {
                _id: '$did',
                pub_id: { $first: '$pub_id' },
                count: { $sum: 1 },
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'pub_id',
                foreignField: 'uid',
                as: 'publisherdata'
            }
        }
    ]).then(data => {
        let i = 0;
        const max = data.reduce((max, p) => p.count > max.count ? p : max, data[0]);
        if(max === undefined){
            res.json({ data: '-NA-' });
        } else if(max.publisherdata[0] === undefined){
            res.json({ data: '-NA-' });
        }else {
            res.json({ data: max.publisherdata[0].fullname });
        }
        
    }).catch(next);
}

module.exports = cdr;
