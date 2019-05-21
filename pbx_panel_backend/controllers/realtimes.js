var mongoose = require('mongoose');
const db = require("../config/db"); //fetch mailing-configs from Utility module
var Realtime_Calls = mongoose.model('Realtime_Calls');
var Realtime_Status = mongoose.model('Realtime_Status');
var Buyer_Number = mongoose.model('Buyer_Number');
var User = mongoose.model('User');
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

var realtime = {};


realtime.getCalls = (req, res, next) => {
    let mergeArr = {};
    return new Promise((resolve, reject) => {
        function getPublisherName(a) {
            let name = '-NA-';
            const arr = a[16].split('=');
            if (arr[1] !== undefined) {
                name = arr[1];
                for (let i = 17; i < a.length; i++) {
                    name += ' ' + a[i];
                }
            }
            return name;
        }
        function getStatus(src, dst) {
            return new Promise((resolve, reject) => {
                let query = { src: src, dst: dst };
                Realtime_Status.findOne(query, 'status').sort({ _id: -1 }).then(data => {
                    // console.log(data);
                    if (data == null) {
                        return resolve('show');
                    }
                    return resolve(data.status);
                }).catch(next);
            });
        }

        function realTimeInLoop(data) {
            const pos = data.length - 1;
            let finalArr = [];
            return data.reduce(async function (r, a, index) {
                let time = (a[10] !== undefined) ? a[10] : '0h0m0s';
                let hour = time.split('h');
                let min = hour[1].split('m');
                let sec = min[1].split('s');
                let pub_id = 0;
                let publisherName = '-NA-';
                let queue = '';
                if(a[11] !== undefined){
                    queueArr = a[11].split('=');
                    queueArr = queueArr[1].split('-');
                    queue = queueArr[1];
                }
                let tfn = 0;
                if (a[15] !== undefined) {
                    pub_id = parseInt(a[15]);
                }
                if (a[12] !== undefined) {
                    const tfnArr = a[12].split('=');
                    tfn = tfnArr[1];
                    publisherName = getPublisherName(a);
                }
                let status = await getStatus(a[7], tfn);
                // let status = 'show';

                if (req.query.status === 'show') {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id,queue: queue,  "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                    }
                } else {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue,  "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                    }
                }

                if (pos == index) {
                    return finalArr;
                }

            }, Object.create(null));
        }

        function mergeArray(data) {
            
            return new Promise((resolve, reject) => {
                let t = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['tfn'] > 0) {
                        if (mergeArr[data[i]['pub_id']] === undefined) {
                            t = 0;
                            mergeArr[data[i]['pub_id']] = { publisher: data[i]['publisherName'], calls: {}, total: 0 };
                        } else {
                            t = mergeArr[data[i]['pub_id']].total;
                        }
                        if (!mergeArr[data[i]['pub_id']].calls.hasOwnProperty(data[i]['tfn'])) {
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']] = [];
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']].push(data[i]);
                        } else {
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']].push(data[i]);
                        }
                        t++;
                        mergeArr[data[i]['pub_id']].total = t;
                    }
                }
                resolve(mergeArr)
            });
        }


        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];
            const arr = data2.call_data.trim('\n').split('___BREAK___');
            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            //return res.json({data:result});
            return result;
        }).then(data => {
            return realTimeInLoop(data);
        }).then(data => {
            return mergeArray(data);
        }).then(result => {
            resolve(res.json({ "data": result }));

        }).catch(err => {
            reject(err);
        });
    });
}
realtime.getCapping = (req, res, next) => {
    let mergeArr = {};
    return new Promise((resolve, reject) => {
        function getPublisherName(a) {
            let name = '-NA-';
            const arr = a[16].split('=');
            if (arr[1] !== undefined) {
                name = arr[1];
                for (let i = 17; i < a.length; i++) {
                    name += ' ' + a[i];
                }
            }
            return name;
        }
        function getStatus(src, dst) {
            return new Promise((resolve, reject) => {
                let query = { src: src, dst: dst };
                Realtime_Status.findOne(query, 'status').sort({ _id: -1 }).then(data => {
                    // console.log(data);
                    if (data == null) {
                        return resolve('show');
                    }
                    return resolve(data.status);
                }).catch(next);
            });
        }

        function realTimeInLoop(data) {
            const pos = data.length - 1;
            let finalArr = [];
            return data.reduce(async function (r, a, index) {
                let time = (a[10] !== undefined) ? a[10] : '0h0m0s';
                let hour = time.split('h');
                let min = hour[1].split('m');
                let sec = min[1].split('s');
                let pub_id = 0;
                let publisherName = '-NA-';
                let queue = '';
                if(a[11] !== undefined){
                    queueArr = a[11].split('=');
                    queueArr = queueArr[1].split('-');
                    queue = queueArr[1];
                }
                let tfn = 0;
                if (a[15] !== undefined) {
                    pub_id = parseInt(a[15]);
                }
                if (a[12] !== undefined) {
                    const tfnArr = a[12].split('=');
                    tfn = tfnArr[1];
                    publisherName = getPublisherName(a);
                }
                let status = await getStatus(a[7], tfn);
                // let status = 'show';

                if (req.query.status === 'show') {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id,queue: queue,  "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                    }
                } else {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue,  "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, queue: queue, "status": status, 'publisherName': publisherName })
                    }
                }

                if (pos == index) {
                    return finalArr;
                }

            }, Object.create(null));
        }

        function mergeArray(data) {
            return new Promise((resolve, reject) => {
                let t = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['tfn'] > 0) {
                        if (mergeArr[data[i]['queue']] === undefined) {
                            t = 0;
                            mergeArr[data[i]['queue']] = { publisher: queue, calls: {}, total: 0 };
                        } else {
                            t = mergeArr[data[i]['queue']].total;
                        }
                        if (!mergeArr[data[i]['queue']].calls.hasOwnProperty(data[i]['tfn'])) {
                            mergeArr[data[i]['queue']].calls[data[i]['tfn']] = [];
                            mergeArr[data[i]['queue']].calls[data[i]['tfn']].push(data[i]);
                        } else {
                            mergeArr[data[i]['queue']].calls[data[i]['tfn']].push(data[i]);
                        }
                        t++;
                        mergeArr[data[i]['queue']].total = t;
                    }
                }
                resolve(mergeArr)
            });
        }


        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];
            const arr = data2.call_data.trim('\n').split('___BREAK___');
            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            //return res.json({data:result});
            return result;
        }).then(data => {
            return realTimeInLoop(data);
        }).then(data => {
            return mergeArray(data);
        }).then(result => {
            resolve(res.json({ "data": result }));

        }).catch(err => {
            reject(err);
        });
    });
}
/* getSpecificBuyer */
realtime.getSpecificBuyer = (req, res, next) => {
    let mergeArr = [];
    return new Promise((resolve, reject) => {
        function reduceArray(data) {
            return data.filter(a => (a !== null));
            //return data;
        }
        function getPublisherName(a) {
            let name = '-NA-';
            const arr = a[16].split('=');
            if (arr[1] !== undefined) {
                name = arr[1];
                for (let i = 17; i < a.length; i++) {
                    name += ' ' + a[i];
                }
            }
            return name;
        }

        function realTimeInLoop(data) {
            const pos = data.length - 1;
            let finalArr = [];
            return data.reduce(async function (r, a, index) {
                let time = (a[10] !== undefined) ? a[10] : '0h0m0s';
                let hour = time.split('h');
                let min = hour[1].split('m');
                let sec = min[1].split('s');
                let pub_id = parseInt(a[15]);
                let publisherName = '-NA-';

                let tfn = 0;
                if (a[12] !== undefined) {
                    const tfnArr = a[12].split('=');
                    tfn = tfnArr[1];
                    publisherName = getPublisherName(a);
                }
                let status = 'show';
                //console.log(tfn);
                if ((req.query.tfn) && (req.query.pub_id)) {
                    if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.tfn) {
                    if (req.query.tfn == tfn) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.pub_id) {
                    if (req.query.pub_id == pub_id) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.publisher && (req.query.tfn)) {
                    if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.publisher) {
                    if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else {
                    finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                }

                if (pos == index) {
                    return finalArr;
                }
            }, Object.create(null));
        }
        /* get buyer name */
        function buyerName(num) {
            return new Promise((resolve, reject) => {
                let aggregate = [
                    {
                        $match: { number: num },
                    },
                    {
                        $lookup: {
                            from: 'buyers',
                            localField: 'buyer_id',
                            foreignField: 'buyer_id',
                            as: 'buyerdata'
                        }
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            buyer_id: 1,
                            buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                        }
                    }
                ];
                Buyer_Number.aggregate(aggregate).then(data => {
                    // console.log(data);
                    if (!data) {
                        return resolve('-NA-');
                    }
                    return resolve(data[0]);
                }).catch(next);
            });
        }

        function mergeArray(data) {
            return new Promise(async (resolve, reject) => {
                let t = 0;
                let k = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['caller_id'] > 0) {
                        if (data[i]['caller_id'].length >= 9) {
                            const d = await buyerName(data[i]['caller_id']);
                            if (d.buyer_id === parseInt(req.query.buyer_id)) {
                                if (mergeArr[d.buyer_id] === undefined) {
                                    t = 0;
                                    mergeArr[d.buyer_id] = { key: data[i]['caller_id'], name: d.buyerName, calls: [], total: 0, dynamic: true };
                                } else {
                                    t = mergeArr[d.buyer_id].total;
                                }
                                //mergeArr[d.buyer_id].calls = [...mergeArr[d.buyer_id].calls, data[i]];

                                if (mergeArr[d.buyer_id].key === data[i]['caller_id']) {
                                    if (!mergeArr[d.buyer_id].calls.hasOwnProperty(k)) {
                                        mergeArr[d.buyer_id].calls[k] = [];
                                    }
                                    mergeArr[d.buyer_id].calls[k] = [...mergeArr[d.buyer_id].calls[k], data[i]];
                                } else {
                                    k++;
                                    if (!mergeArr[d.buyer_id].calls.hasOwnProperty(k)) {
                                        mergeArr[d.buyer_id].calls[k] = [];
                                    }
                                    mergeArr[d.buyer_id].calls[k] = [...mergeArr[d.buyer_id].calls[k], data[i]];
                                }

                                t++;
                                mergeArr[d.buyer_id].total = t;
                            }
                        }
                    }
                }
                // console.log(mergeArr, 'last');
                resolve(mergeArr);
            });
        }

        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];
            const arr = data2.call_data.trim('\n').split('___BREAK___');

            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            // return res.json({data:result});
            return result;
        }).then(data => {
            return realTimeInLoop(data);
        }).then(data => {
            return mergeArray(data);
        }).then(data => {
            return reduceArray(data);
        }).then(result => {
            resolve(res.json({ "data": result }));
        }).catch(err => {
            reject(err);
        });
    });
}

realtime.getRealtime = (req, res, next) => {
    let mergeArr = {};
    return new Promise((resolve, reject) => {
        function getPublisherName(a) {
            let name = '-NA-';
            const arr = a[16].split('=');
            if (arr[1] !== undefined) {
                name = arr[1];
                for (let i = 17; i < a.length; i++) {
                    name += ' ' + a[i];
                }
            }
            return name;
        }
        function getStatus(src, dst) {
            return new Promise((resolve, reject) => {
                let query = { src: src, dst: dst };
                Realtime_Status.findOne(query, 'status').sort({ _id: -1 }).then(data => {
                    // console.log(data);
                    if (data == null) {
                        return resolve('show');
                    }
                    return resolve(data.status);
                }).catch(next);
            });
        }

        function realTimeInLoop(data) {
            const pos = data.length - 1;
            let finalArr = [];
            return data.reduce(async function (r, a, index) {
                let time = (a[10] !== undefined) ? a[10] : '0h0m0s';
                let hour = time.split('h');
                let min = hour[1].split('m');
                let sec = min[1].split('s');
                let pub_id = 0;
                let publisherName = '-NA-';


                let tfn = 0;
                if (a[15] !== undefined) {
                    pub_id = parseInt(a[15]);
                }
                if (a[12] !== undefined) {
                    const tfnArr = a[12].split('=');
                    tfn = tfnArr[1];
                    publisherName = getPublisherName(a);
                }
                let status = await getStatus(a[7], tfn);
                // let status = 'show';

                if (req.query.status === 'show') {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                    }
                } else {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                    }
                }

                if (pos == index) {
                    return finalArr;
                }

            }, Object.create(null));
        }

        function mergeArray(data) {
            return new Promise((resolve, reject) => {
                let t = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['tfn'] > 0) {
                        if (mergeArr[data[i]['pub_id']] === undefined) {
                            t = 0;
                            mergeArr[data[i]['pub_id']] = { publisher: data[i]['publisherName'], calls: {}, total: 0 };
                        } else {
                            t = mergeArr[data[i]['pub_id']].total;
                        }
                        if (!mergeArr[data[i]['pub_id']].calls.hasOwnProperty(data[i]['tfn'])) {
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']] = [];
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']].push(data[i]);
                        } else {
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']].push(data[i]);
                        }
                        t++;
                        mergeArr[data[i]['pub_id']].total = t;
                    }
                }
                resolve(mergeArr)
            });
        }


        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];
            const arr = data2.call_data.trim('\n').split('___BREAK___');
            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            //return res.json({data:result});
            return result;
        }).then(data => {
            return realTimeInLoop(data);
        }).then(data => {
            return mergeArray(data);
        }).then(result => {
            resolve(res.json({ "data": result }));

        }).catch(err => {
            reject(err);
        });
    });
}
/* get Realtime counts for dashboard */
realtime.getCount = (req, res, next) => {
    let mergeArr = {};
    return new Promise((resolve, reject) => {
        function realtimefilter(data) {
            return data.filter((v) => {
                if (req.query.pub_id) {
                    if (v[15] === req.query.pub_id) {
                        return true;
                    }
                } else {
                    return true;
                }
            });
        }
        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];

            const arr = data2.call_data.trim('\n').split('___BREAK___');
            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            // return res.json({data:result});
            return result;
        }).then(data => {
            return realtimefilter(data);
        }).then(data => {
            resolve(res.json({ realtimecount: data.length }));
        }).catch(err => {
            reject(err);
        });
    });
}

/* Buyer Realtime Count */
realtime.getBuyerRealtime = (req, res, next) => {
    let mergeArr = [];
    return new Promise((resolve, reject) => {
        function reduceArray(data) {
            return data.filter(a => (a !== null));
            //return data;
        }
        function getPublisherName(a) {
            let name = '-NA-';
            const arr = a[16].split('=');
            if (arr[1] !== undefined) {
                name = arr[1];
                for (let i = 17; i < a.length; i++) {
                    name += ' ' + a[i];
                }
            }
            return name;
        }

        function realTimeInLoop(data) {
            const pos = data.length - 1;
            let finalArr = [];
            return data.reduce(async function (r, a, index) {
                let time = (a[10] !== undefined) ? a[10] : '0h0m0s';
                let hour = time.split('h');
                let min = hour[1].split('m');
                let sec = min[1].split('s');
                let pub_id = parseInt(a[15]);
                let publisherName = '-NA-';

                let tfn = 0;
                if (a[12] !== undefined) {
                    const tfnArr = a[12].split('=');
                    tfn = tfnArr[1];
                    publisherName = getPublisherName(a);
                }
                let status = 'show';
                //console.log(tfn);
                if ((req.query.tfn) && (req.query.pub_id)) {
                    if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.tfn) {
                    if (req.query.tfn == tfn) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.pub_id) {
                    if (req.query.pub_id == pub_id) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.publisher && (req.query.tfn)) {
                    if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else if (req.query.publisher) {
                    if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                    }
                } else {
                    finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName });
                }

                if (pos == index) {
                    return finalArr;
                }
            }, Object.create(null));
        }
        /* get buyer name */
        function buyerName(num) {
            return new Promise((resolve, reject) => {
                let aggregate = [
                    {
                        $match: { number: num },
                    },
                    {
                        $lookup: {
                            from: 'buyers',
                            localField: 'buyer_id',
                            foreignField: 'buyer_id',
                            as: 'buyerdata'
                        }
                    },
                    { $limit: 1 },
                    {
                        $project: {
                            buyer_id: 1,
                            buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                        }
                    }
                ];
                Buyer_Number.aggregate(aggregate).then(data => {
                    // console.log(data);
                    if (!data) {
                        return resolve('-NA-');
                    }
                    return resolve(data[0]);
                }).catch(next);
            });
        }

        function mergeArray(data) {
            return new Promise(async (resolve, reject) => {
                let t = 0;
                let k = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['caller_id'] > 0) {
                        if (data[i]['caller_id'].length >= 9) {
                            const d = await buyerName(data[i]['caller_id']);
                            if (mergeArr[d.buyer_id] === undefined) {
                                t = 0;
                                mergeArr[d.buyer_id] = { key: data[i]['caller_id'], name: d.buyerName, calls: [], total: 0, dynamic: true };
                            } else {
                                t = mergeArr[d.buyer_id].total;
                            }
                            //mergeArr[d.buyer_id].calls = [...mergeArr[d.buyer_id].calls, data[i]];

                            if (mergeArr[d.buyer_id].key === data[i]['caller_id']) {
                                if (!mergeArr[d.buyer_id].calls.hasOwnProperty(k)) {
                                    mergeArr[d.buyer_id].calls[k] = [];
                                }
                                mergeArr[d.buyer_id].calls[k] = [...mergeArr[d.buyer_id].calls[k], data[i]];
                            } else {
                                k++;
                                if (!mergeArr[d.buyer_id].calls.hasOwnProperty(k)) {
                                    mergeArr[d.buyer_id].calls[k] = [];
                                }
                                mergeArr[d.buyer_id].calls[k] = [...mergeArr[d.buyer_id].calls[k], data[i]];
                            }

                            t++;
                            mergeArr[d.buyer_id].total = t;
                        }
                        if (data[i]['caller_id'].length === 4) {
                            if (data[i]['caller_id'] >= 1001 && data[i]['caller_id'] <= 1099) {
                                if (mergeArr[0] === undefined) {
                                    t = 0;
                                    mergeArr[0] = { key: 'tech_chhd', name: 'Tech CHHD', calls: [], total: 0, dynamic: false };
                                    mergeArr[0].calls[0] = [];
                                } else {
                                    t = mergeArr[0].total;
                                }
                                t++;
                                mergeArr[0].total = t;
                                mergeArr[0].calls[0] = [...mergeArr[0].calls[0], data[i]];
                            }
                            if (data[i]['caller_id'] >= 2001 && data[i]['caller_id'] <= 2150) {
                                if (mergeArr[1] === undefined) {
                                    t = 0;
                                    mergeArr[1] = { key: 'tech_ggn', name: 'Tech GGN', calls: [], total: 0, dynamic: false };
                                    mergeArr[1].calls[0] = [];
                                } else {
                                    t = mergeArr[1].total;
                                }
                                t++;
                                mergeArr[1].total = t;
                                mergeArr[1].calls[0] = [...mergeArr[1].calls[0], data[i]];
                            }
                            if (data[i]['caller_id'] >= 9001 && data[i]['caller_id'] <= 9040) {
                                if (mergeArr[2] === undefined) {
                                    t = 0;
                                    mergeArr[2] = { key: 'tech_tunis', name: 'Tech TUNIS', calls: [], total: 0, dynamic: false };
                                    mergeArr[2].calls[0] = [];
                                } else {
                                    t = mergeArr[2].total;
                                }
                                t++;
                                mergeArr[2].total = t;
                                mergeArr[2].calls[0] = [...mergeArr[2].calls[0], data[i]];
                            }
                        }
                        if (data[i]['caller_id'].length === 5) {
                            if (mergeArr[3] === undefined) {
                                t = 0;
                                mergeArr[3] = { key: 'travel', name: 'Travel', calls: [], total: 0, dynamic: false };
                                mergeArr[3].calls[0] = [];
                            } else {
                                t = mergeArr[2].total;
                            }
                            t++;
                            mergeArr[3].total = t;
                            mergeArr[3].calls[0] = [...mergeArr[3].calls[0], data[i]];
                        }
                    }
                }
                // console.log(mergeArr, 'last');
                resolve(mergeArr);
            });
        }

        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];
            const arr = data2.call_data.trim('\n').split('___BREAK___');

            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            // return res.json({data:result});
            return result;
        }).then(data => {
            return realTimeInLoop(data);
        }).then(data => {
            return mergeArray(data);
        }).then(data => {
            return reduceArray(data);
        }).then(result => {
            resolve(res.json({ "data": result }));
        }).catch(err => {
            reject(err);
        });
    });
}

/* get Realtime publisher without hidden calls for admin*/
realtime.getPublisher = (req, res, next) => {
    let mergeArr = {};
    return new Promise((resolve, reject) => {
        function realtimefilter(data) {
            return data.filter((v) => {
                if (v.status === 'show') {
                    return true;
                } else {
                    return false;
                }
            });
        }
        function getPublisherName(a) {
            let name = '-NA-';
            const arr = a[16].split('=');
            if (arr[1] !== undefined) {
                name = arr[1];
                for (let i = 17; i < a.length; i++) {
                    name += ' ' + a[i];
                }
            }
            return name;
        }
        function getStatus(src, dst) {
            return new Promise((resolve, reject) => {
                let query = { src: src, dst: dst };
                Realtime_Status.findOne(query, 'status').sort({ _id: -1 }).then(data => {
                    // console.log(data);
                    if (data == null) {
                        return resolve('show');
                    }
                    return resolve(data.status);
                }).catch(next);
            });
        }

        function realTimeInLoop(data) {
            const pos = data.length - 1;
            let finalArr = [];
            return data.reduce(async function (r, a, index) {
                let time = (a[10] !== undefined) ? a[10] : '0h0m0s';
                let hour = time.split('h');
                let min = hour[1].split('m');
                let sec = min[1].split('s');
                let pub_id = 0;
                let publisherName = '-NA-';


                let tfn = 0;
                if (a[15] !== undefined) {
                    pub_id = parseInt(a[15]);
                }
                if (a[12] !== undefined) {
                    const tfnArr = a[12].split('=');
                    tfn = tfnArr[1];
                    publisherName = getPublisherName(a);
                }
                let status = await getStatus(a[7], tfn);
                // let status = 'show';

                if (req.query.status === 'show') {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                    }
                } else {
                    if ((req.query.tfn) && (req.query.pub_id)) {
                        if ((req.query.tfn == tfn) && (req.query.pub_id == a[15])) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.tfn) {
                        if (req.query.tfn == tfn) {

                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.pub_id) {
                        if (req.query.pub_id == pub_id) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher && (req.query.tfn)) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1 && (req.query.tfn == tfn)) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else if (req.query.publisher) {
                        if (publisherName.toLowerCase().indexOf(req.query.publisher.toLowerCase()) > -1) {
                            finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                        }
                    } else {
                        finalArr.push({ "tfn": tfn, "caller_id": a[2], "connected_line": a[7], "time": ('0' + hour[0]).slice(-2) + ':' + ('0' + min[0]).slice(-2) + ':' + ('0' + sec[0]).slice(-2), "pub_id": pub_id, "status": status, 'publisherName': publisherName })
                    }
                }

                if (pos == index) {
                    return finalArr;
                }

            }, Object.create(null));
        }

        function mergeArray(data) {
            return new Promise((resolve, reject) => {
                let t = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['tfn'] > 0) {
                        if (mergeArr[data[i]['pub_id']] === undefined) {
                            t = 0;
                            mergeArr[data[i]['pub_id']] = { publisher: data[i]['publisherName'], calls: {}, total: 0 };
                        } else {
                            t = mergeArr[data[i]['pub_id']].total;
                        }
                        if (!mergeArr[data[i]['pub_id']].calls.hasOwnProperty(data[i]['tfn'])) {
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']] = [];
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']].push(data[i]);
                        } else {
                            mergeArr[data[i]['pub_id']].calls[data[i]['tfn']].push(data[i]);
                        }
                        t++;
                        mergeArr[data[i]['pub_id']].total = t;
                    }
                }
                resolve(mergeArr)
            });
        }


        Realtime_Calls.findOne({}).sort({ _id: -1 }).then(data2 => {
            if (!data2) { return res.sendStatus(422); }
            let result = [];
            const arr = data2.call_data.trim('\n').split('___BREAK___');
            arr.forEach(function (element) {
                element = element.trim();
                result.push(element.split(' '));
            });
            //return res.json({data:result});
            return result;
        }).then(data => {
            return realTimeInLoop(data);
        }).then(data => {
            return realtimefilter(data);
        }).then(data => {
            return mergeArray(data);
        }).then(result => {
            resolve(res.json({ "data": result }));

        }).catch(err => {
            reject(err);
        });
    });
}
module.exports = realtime;
