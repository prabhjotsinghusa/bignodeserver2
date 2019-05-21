var mongoose = require('mongoose');
const db = require("../config/db"); //fetch mailing-configs from Utility module
const curl = new (require('curl-request'))();
var Realtime_Calls = mongoose.model('Realtime_Calls');
var Realtime_Status = mongoose.model('Realtime_Status');
var Buyer_Number = mongoose.model('Buyer_Number');
var User = mongoose.model('User');
var async = require("async");
var request = require('request-promise');
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

var secondrealtime = {};


secondrealtime.getSpecificBuyer = (req, res, next) => {
    let mergeArr = [];
    return new Promise((resolve, reject) => {



        function reduceArray(data) {
            return data.filter(a => (a !== null));
            //return data;
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

                    if (data[i]['buyer_number'] > 0) {

                        if (data[i]['buyer_number'].length >= 9) {

                            const d = await buyerName(data[i]['buyer_number']);

                            if (d.buyer_id === parseInt(req.query.buyer_id)) {

                                if (mergeArr[d.buyer_id] === undefined) {
                                    t = 0;
                                    mergeArr[d.buyer_id] = { key: data[i]['buyer_number'], name: d.buyerName, calls: [], total: 0, dynamic: true };
                                } else {
                                    t = mergeArr[d.buyer_id].total;
                                }
                                //mergeArr[d.buyer_id].calls = [...mergeArr[d.buyer_id].calls, data[i]];

                                if (mergeArr[d.buyer_id].key === data[i]['buyer_number']) {
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

        request('http://66.185.29.98/prishi/realtime.php')
            .then(async (body) => {

                // console.log(body, "=======================")
                //resolve(statusCode, body, headers);
    
                return body;
            }).catch((e) => {
                console.log(e);
            }).then(data => {
                return mergeArray(JSON.parse(data));
            }).then(data => {
                return reduceArray(data);
            }).then(result => {
                resolve(res.json({ "data": result }));
            }).catch(err => {
                reject(err);
            });
    });
}

secondrealtime.getBuyer = (req, res, next) => {
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

                if (!data) {
                    return resolve('-NA-');
                }
                return resolve(data[0]);
            }).catch(next);
        });

    }

    function filterNullValues(data) {

        return new Promise(async (resolve, reject) => {
            const filterArr = await data.filter(x => x);
            resolve(filterArr);
        });


    }

    function mergeArray(data) {

        let mergeArr = [];
        return new Promise(async (resolve, reject) => {

            let t = 0;
            let k = 6;

            for (let i = 0; i < data.length; i++) {

                if (data[i]['buyer_number'] > 0) {

                    if (data[i]['buyer_number'].length >= 6) {

                        const d = await buyerName(data[i]['buyer_number']);
                        if(d.buyer_id !== undefined){
                            if (mergeArr[d.buyer_id] === undefined) {
                                t = 0;
                                mergeArr[d.buyer_id] = { key: data[i]['buyer_number'], name: d.buyerName, calls: [], total: 0, dynamic: true };                            
                            } else {
                                t = mergeArr[d.buyer_id].total;
                            }
                            
                            if (mergeArr[d.buyer_id].key === data[i]['buyer_number']) {
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
                    if (data[i]['buyer_number'].length === 4) {
                        if (data[i]['buyer_number'] >= 1001 && data[i]['buyer_number'] <= 1099) {
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
                        if (data[i]['buyer_number'] >= 2001 && data[i]['buyer_number'] <= 2150) {
                            if (mergeArr[1] === undefined) {
                                t = 0;
                                mergeArr[1] = { key: 'tech_ggn', name: 'Tech LDH', calls: [], total: 0, dynamic: false };
                                mergeArr[1].calls[0] = [];
                            } else {
                                t = mergeArr[1].total;
                            }
                            t++;
                            mergeArr[1].total = t;
                            mergeArr[1].calls[0] = [...mergeArr[1].calls[0], data[i]];
                        }                       
                        if (data[i]['buyer_number'] >= 3001 && data[i]['buyer_number'] <= 3050) {
                            if (mergeArr[3] === undefined) {
                                t = 0;
                                mergeArr[3] = { key: 'tech_mada', name: 'Tech MADA', calls: [], total: 0, dynamic: false };
                                mergeArr[3].calls[0] = [];
                            } else {
                                t = mergeArr[3].total;
                            }
                            t++;
                            mergeArr[3].total = t;
                            mergeArr[3].calls[0] = [...mergeArr[3].calls[0], data[i]];
                        }
                        if ((data[i]['buyer_number'] >= 5001 && data[i]['buyer_number'] <= 5096)||(data[i]['buyer_number'] >= 5129 && data[i]['buyer_number'] <= 5240)) {
                            if (mergeArr[4] === undefined) {
                                t = 0;
                                mergeArr[4] = { key: 'tech_rch', name: 'Tech RCH', calls: [], total: 0, dynamic: false };
                                mergeArr[4].calls[0] = [];
                            } else {
                                t = mergeArr[4].total;
                            }
                            t++;
                            mergeArr[4].total = t;
                            mergeArr[4].calls[0] = [...mergeArr[4].calls[0], data[i]];
                        }
                        if (data[i]['buyer_number'] >= 9001 && data[i]['buyer_number'] <= 9040) {
                            if (mergeArr[5] === undefined) {
                                t = 0;
                                mergeArr[5] = { key: 'tech_tunis', name: 'Tech TUNIS', calls: [], total: 0, dynamic: false };
                                mergeArr[5].calls[0] = [];
                            } else {
                                t = mergeArr[5].total;
                            }
                            t++;
                            mergeArr[5].total = t;
                            mergeArr[5].calls[0] = [...mergeArr[5].calls[0], data[i]];
                        }
                    }
                    if (data[i]['buyer_number'].length === 5) {
                        if (mergeArr[6] === undefined) {
                            t = 0;
                            mergeArr[6] = { key: 'travel', name: 'Travel', calls: [], total: 0, dynamic: false };
                            mergeArr[6].calls[0] = [];
                        } else {
                            t = mergeArr[6].total;
                        }
                        t++;
                        mergeArr[6].total = t;
                        mergeArr[6].calls[0] = [...mergeArr[6].calls[0], data[i]];
                    }
                }
            }
            // console.log(mergeArr, 'last');
            let filterNull = await filterNullValues(mergeArr);
            resolve(filterNull)
        });
    }



    return new Promise((resolve, reject) => {
        // http://66.185.29.98/prishi/realtime.php
        request('https://portal.pbx4you.com/realtime.php')
            .then(async (body) => {

                // console.log(body, "=======================")
                //resolve(statusCode, body, headers);
               const result = await mergeArray(JSON.parse(body));
      
                return res.json({ data: result });
            }).catch((e) => {
              
            });

    });


}

secondrealtime.getSpecificPub = (req, res, next)=>{


    function getRealtime(){
        return new Promise((resolve, reject) => {

           request('http://66.185.29.98/prishi/realtime.php')
                .then( body => {
    
                    // console.log(body, "=======================")
                    //resolve(statusCode, body, headers);
                    return resolve(body);
                })
                .catch(error => {
                    reject(error);
                });
    
        });
    }

    function filterPublisher(data, pub_id){
        let filterArr = [];
         data.map((item,index) => {
            if(item.status === 'show' && parseInt(item.queue)===pub_id){
                delete item.status;
                delete item.queue;
                delete item.channel
                delete item.camp_id;
                delete item.buyer_number;
                delete item.pub_name;
                item.talking_to = 'xxxx-xxx-'+item.talking_to.substr(-4);
                filterArr =[...filterArr, item];                
            }
        });
        return filterArr;
    }

    User.findOne({
        username:req.query.username,
        password:encodeMD5(req.query.password)

    }).then(async data=>{
        if(data) {
            let result = await getRealtime();
            result = filterPublisher(JSON.parse(result), data.uid);
            return res.json({data:result, total_calls: result.length});            
        } else {
            return res.sendStatus(422);
        }
     

    }).catch(next);
}


module.exports = secondrealtime;
