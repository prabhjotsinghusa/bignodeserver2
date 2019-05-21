var mongoose = require('mongoose');
let Cappings = mongoose.model('Cc_Capping');
let Realtime_Calls = mongoose.model('Realtime_Calls');
let Buyer_Number = mongoose.model('Buyer_Number');

const exec = require('child_process').exec;

const db = require("../config/db"); //fetch mailing-configs from Utility module

const {
    sendEmail,
    sendResetPasswordMail,
    contactUserMail,
} = require("../config/mailing"); //fetch mailing-configs from Utility module

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString,
    serverCall
} = require('../Utilities/Utilities');

var cappings = {};


cappings.check = (req, res, next) => {

    let query = {};
    query = req.query;
    query.password = encodeMD5(req.query.p);
    Cappings.findOne(query).then(data => {
        return res.json({ capping: query });
    }).catch(next);
}

cappings.getAll2 = (req, res, next) => {
    Cappings.find({}).then(data => {
        if (!data) { return res.sendStatus(422); }
        return res.json({ data: data });
    }).catch(next);
}
cappings.getAll = (req, res, next) => {
    function ModifyArray(data) {
        let arr = {};
        data.forEach(async element => {
            if (arr[element.queue] === undefined) {
                arr[element.queue] = [];
            }
            arr[element.queue] = [...arr[element.queue], element];
        });
        return arr;
    }
    let query = {};
    if (req.params.id) {
        query = { _id: mongoose.Types.ObjectId(req.params.id) };
    }
    Cappings.aggregate([
        {
            $match: query,
        },
        {
            $lookup: {
                from: 'buyer_numbers',
                localField: 'buyer_number',
                foreignField: 'number',
                as: 'buyerNumbers'
            }
        },
        {
            $lookup: {
                from: 'buyers',
                localField: "buyerNumbers.buyer_id",
                foreignField: 'buyer_id',
                as: 'buyerdata'
            }
        },
        {
            $project: {
                buyer_number: 1,
                queue: 1,
                capping: 1,
                global_cap: 1,
                status: 1,
                pause_status: 1,
                priority: 1,
                b_number: { $arrayElemAt: ["$buyerNumbers.number", -1] },
                buyer: { $arrayElemAt: ["$buyerdata.name", -1] },

            }
        }
    ]).then(data => {
        return ModifyArray(data);
    }).then(data => {
        return res.json({ cappings: data });
    }).catch(next);
}

cappings.get = (req, res, next) => {

    let query = {};
    if (req.query.queue) {
        query.queue = req.query.queue;
    }
    if (req.query.buyer_number) {
        query.buyer_number = req.query.buyer_number;
    }
    if (req.query.id) {
        query = { _id: mongoose.Types.ObjectId(req.query.id) };
    }
    Cappings.findOne(query).then(data => {
        return res.json({ capping: data });
    }).catch(next);
}

cappings.deleteRow = (req, res, next) => {
    Cappings.findByIdAndRemove({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ success: 'OK', message: 'Active hours removed successfully' });
    }).catch(next);

}

cappings.add = async (req, res, next) => {

    let cap = new Cappings();
    cap.queue = req.body.queue;
    cap.buyer_number = req.body.buyer_number;
    cap.capping = req.body.capping;
    cap.global_cap = req.body.global_cap;
    cap.save().then(result => {
        if (!result) { return res.sendStatus(422) }
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO queues_details(id,keyword,data,flags) values('` + result.queue + `','member','Local/` + result.buyer_number + `@from-queue/n,0',0)`;
            console.log(sql, 'adding the capping');
            db.query(sql, (err, data) => {
                if (err) {
                    reject(res.json({ success: 'NOK', message: err }));
                } else {
                    serverCall();
                    resolve(res.json({ capping: result }));
                }
            });
        });
    }).catch(next);
}

cappings.update = (req, res, next) => {
    let updateObj = {};
    if (req.body.capping) {
        updateObj.capping = req.body.capping;
    }
    if (req.body.global_cap) {
        updateObj.global_cap = req.body.global_cap;
    }

    const query = {
        _id: mongoose.Types.ObjectId(req.params.id)
    },
        update = {
            $set: updateObj
        },
        options = {
            new: false,
            upsert: false
        };

    Cappings.findByIdAndUpdate(query, update, options).then(data => {
        if (!data) { return res.sendStatus(422); }
        return res.json({ capping: data });
    }).catch(next);

}


cappings.changeStatus = (req, res, next) => {
    let updateObj = {};
    updateObj.status = req.body.status;

    const query = {
        queue: req.body.queue,
        buyer_number: req.body.buyer_number
    },
        update = {
            $set: updateObj
        },
        options = {
            new: false,
            upsert: false,
            overwrite: false,
        };

    Cappings.findOneAndUpdate(query, update, options).then(data => {
        if (!data) { return res.sendStatus(422); }
        return new Promise((resolve, reject) => {
            let sql = '';
            if (updateObj.status === 'off') {
                sql = "UPDATE queues_details SET keyword='member1' WHERE `data` LIKE '%" + query.buyer_number + "@%' AND `id` = '" + query.queue + "'";
            }
            if (updateObj.status === 'on') {
                sql = "UPDATE queues_details SET keyword='member' WHERE `data` LIKE '%" + query.buyer_number + "@%' AND `id` = '" + query.queue + "'";
            }
            db.query(sql, (err, result) => {
                if (err) {
                    reject(res.json({ success: 'NOK', message: err }));
                } else {
                    serverCall();
                    resolve(res.json({ capping: data }));
                }
            });
        });
    }).catch(next);

}

cappings.changePause = (req, res, next) => {
    let updateObj = {};
    updateObj.pause_status = req.body.pause_status;

    const query = {
        queue: req.body.queue,
        buyer_number: req.body.buyer_number
    },
        update = {
            $set: updateObj
        },
        options = {
            new: false,
            upsert: false
        };

    Cappings.findOneAndUpdate(query, update, options).then(data => {
        if (!data) { return res.sendStatus(422); }
        return new Promise((resolve, reject) => {

            /*  remote server code execution in node */
            //const str = "sshpass -p '!$@DeM0$((.!7$!' ssh -o StrictHostKeyChecking=no root@103.115.35.17 /var/lib/asterisk/bin/module_admin reload";       
            const str = "sshpass -p 'wP9j@Y$?PBX?$%kCN5@C' ssh -o StrictHostKeyChecking=no root@66.185.29.98 /usr/sbin/asterisk -rx \\'queue " + updateObj.pause_status + " member Local/" + query.buyer_number + "@from-queue/n\\'";
            // const str = "sshpass -p 'Welcome@82A' ssh -o StrictHostKeyChecking=no root@162.221.88.195 /usr/sbin/asterisk -rx \\'queue " + updateObj.pause_status + " member Local/" + query.buyer_number + "@from-queue/n\\'";
            console.log(str);
            exec(str, (e, stdout, stderr) => {
                if (e instanceof Error) {
                    console.error(e);
                    reject(e);
                }
                console.log('capping stdout ', stdout);
                console.log('capping stderr ', stderr);
            });
            resolve(res.json({ capping: data }));
        });
    }).catch(next);
}

cappings.changePriority = (req, res, next) => {/* Priority in frontend backend it is penalty */
    let updateObj = {};
    updateObj.priority = req.body.priority;

    const query = {
        queue: req.body.queue,
        buyer_number: req.body.buyer_number
    },
        update = {
            $set: updateObj
        },
        options = {
            new: false,
            upsert: false
        };

    Cappings.findOneAndUpdate(query, update, options).then(data => {
        if (!data) { return res.sendStatus(422); }
        return new Promise((resolve, reject) => {
            let sql = "UPDATE queues_details SET data='Local/" + query.buyer_number + "@from-queue/n," + updateObj.priority + "' WHERE `data` LIKE '%" + query.buyer_number + "@%' AND `id` = '" + query.queue + "'";
            db.query(sql, (err, result) => {
                if (err) {
                    reject(res.json({ success: 'NOK', message: err }));
                } else {
                    /*  remote server code execution in node */
                    //const str = "sshpass -p '!$@DeM0$((.!7$!' ssh -o StrictHostKeyChecking=no root@103.115.35.17 /var/lib/asterisk/bin/module_admin reload";       
                    const str = `sshpass -p 'wP9j@Y$?PBX?$%kCN5@C' ssh -o StrictHostKeyChecking=no root@66.185.29.98 /usr/sbin/asterisk -rvx \\'queue set penalty ` + updateObj.priority + ` on Local/` + query.buyer_number + `@from-queue/n in ` + query.queue + `\\'`;
                    //   const str = `sshpass -p 'Welcome@82A' ssh -o StrictHostKeyChecking=no root@162.221.88.195 /usr/sbin/asterisk -rvx \\'queue set penalty ` + updateObj.priority + ` on Local/` + query.buyer_number + `@from-queue/n in ` + query.queue + `\\'`;
                    console.log(str);
                    exec(str, (e, stdout, stderr) => {
                        if (e instanceof Error) {
                            console.error(e);
                            reject(e);
                        }
                        if (stdout) {
                            serverCall();
                        }
                        console.log('capping stdout ', stdout);
                        console.log('capping stderr ', stderr);
                    });


                    resolve(res.json({ capping: data }));
                }
            });
            /* shell_exec("asterisk -rvx 'queue set penalty $status on Local/$buyer@from-queue/n in $queue'");

                $sql = "update queues_details set data='Local/".$buyer."@from-queue/n,".$status."' WHERE `data` LIKE '%".$buyer."@%' AND `id` = '".$queue."'";

                if ($conn->query($sql) === TRUE) {
                    echo "Member penalty changed.";
                    shell_exec("/var/lib/asterisk/bin/module_admin reload");
                } else {
                    echo "Error: " . $sql . "<br>" . $conn->error;
                } */

        });
    }).catch(next);
}
/* Buyer Realtime Count */

cappings.realtime = (req, res, next) => {

    let mergeArr = {};
    return new Promise((resolve, reject) => {

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
                data.forEach(d => {
                    if (d.caller_id !== undefined) {
                        if (mergeArr[d.caller_id] === undefined) {
                            mergeArr[d.caller_id] = [];
                        }
                        mergeArr[d.caller_id] = [...mergeArr[d.caller_id], d];
                    }
                });
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
        }).then(result => {
            resolve(res.json({ "data": result }));
        }).catch(err => {
            reject(err);
        });
    });
}

cappings.updateDirect = (req, res, next) => {
    let updateObj = {};
    if (req.query.capping) {
        updateObj.capping = req.query.capping;
    }
    if (req.query.global_cap) {
        updateObj.global_cap = req.query.global_cap;
    }
    if (req.query.status) {
        updateObj.status = req.query.status;
    }

    if (req.query.priority) {
        updateObj.priority = req.query.priority;
    }

    const query = {
        queue: req.query.queue,
        buyer_number: req.query.buyer_number
    },
        update = {
            $set: updateObj
        },
        options = {
            new: false,
            upsert: false,
            overwrite: false
        };

    Cappings.findOneAndUpdate(query, update, options).then(data => {
        if (!data) { return res.sendStatus(422); }
        return res.json({ capping: data });
    }).catch(next);

}

cappings.getBuyerCapping = (req, res, next) => {
    
    let str={};
   
    if (req.query.buyer_id) {
        str.buyer_id = parseInt(req.query.buyer_id);
    } else {
        str.number = req.query.number;
    }

   
    Buyer_Number.aggregate([
        { $match: str },
        {
            $lookup: {
                from: 'cc_cappings',
                localField: 'number',
                foreignField: 'buyer_number',
                as: 'cappingData'


            }
        },
        {
            $project: {
                buyer_id: 1,
                number: 1,
                cappingData: 1
            }

        }
    ]
    ).then(data => {
        if (!data) { return sendStatus(422); }
        res.json({ cappings: data });
    }).catch(next);

}
cappings.deleteCapping = (req, res, next) => {
    Cappings.findByIdAndRemove({ _id: mongoose.Types.ObjectId(req.params.id) }).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ success: 'OK', message: 'Buyer Capping removed successfully' });
    }).catch(next);
}

cappings.removeMember = (req, res, next) => {
   
      
    Cappings.findByIdAndRemove({ _id: mongoose.Types.ObjectId(req.body.id) }).then(data => {
        if (!data) { return res.sendStatus(422); }
        //return new Promise((resolve, reject) => {
            let sql = '';
            if (req.body.status === 'off') {
                sql = "DELETE from queues_details WHERE keyword='member' and `data` LIKE '%" + req.body.buyer_number + "@%' AND `id` = '" + req.body.queue + "'";
            }

            db.query(sql, (err, result) => {
                if (err) {
                //    reject(res.json({ success: 'NOK', message: err }));
                return res.json({ success: 'NOK', message: err });
                } else {
                    serverCall();
                    return res.json({ success: 'OK', message: 'Buyer Capping removed successfully' });
                    //resolve(res.json({ capping: data }));

                }
           // });
        });
    }).catch(next);

}

module.exports = cappings;
