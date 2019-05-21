const Cdr = require('../models/cdr.model');
let moment = require('moment');

module.exports = {

    getTotalCalls(req, reply) {
        console.log("sddsdsd");
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
                $gt: req.query.buffer_time
            };
        }


        return Cdr.find(str).exec().then(data => {

            if (!data) {
                return reply.sendStatus(422);
            }
            return { totalcalls: data.length };

        }).catch(err => {

            return { err: err };

        });
    },
    getAHT(req, reply) {
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
                $gt: req.query.buffer_time
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
            }]).exec().then(data => {
                if (!data) {
                    return reply.sendStatus(422);
                }
                return {
                    aht: data
                };

            }).catch(err => {

                return { err: err };

            });
    },

    getTotalUniqueAnsweredCalls(req, reply){
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
                $gt: req.query.buffer_time
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
    
       return  Cdr.distinct('src', str).exec().then(data => {
            if (!data) {
                return reply.sendStatus(422);
            }
            
            return {
                totaluniqueansweredcalls: data.length
            };
        }).catch(err => {

            return { err: err };

        });
    },

    getTotalUniquieCalls(req, reply){
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
                $gt: req.query.buffer_time
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
    
        return Cdr.distinct('src', str).exec().then(data => {
    
            if (!data) {
                return reply.sendStatus(422);
            }
    
            return {
                totalansweredcalls: data.length
            };
        }).catch(err => {

            return { err: err };

        });
    },
    addConcern(req,reply){
        return Cdr.findById(req.payload.id).exec().then(data => {
           // console.log(data);
            data.concern = req.payload.concern || '';
            data.remark = req.payload.remark || '';
            data.save();
            return {
                data:data
            };
        });
    }
}