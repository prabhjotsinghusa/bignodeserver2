var mongoose = require('mongoose');
var Tfn = mongoose.model('Tfn');
var PublisherKey = mongoose.model('PublisherKey');
var User = mongoose.model('User');
var UserSettings = mongoose.model('User_Settings');
const request = require('request-promise');

const db = require('../config/db');

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
    serverCall
} = require('../Utilities/Utilities');

var tfn = {};



tfn.getDashboardTfns = (req, res, next) => {
    let query = {};

    if (req.query.pub_id) {
        query.pub_id = parseInt(req.query.pub_id);
    }

    Tfn.countDocuments(query).then((data) => {
        return res.json({ totaltfns: data });
    }).catch(next);
}

tfn.getAllTfns = (req, res, next) => {


    const aggregateObj = [

        {
            $match: { status: { $ne: 'inactive' } }
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
            $project:
            {

                "tfn_id": 1,
                "tfn": 1,
                "pub_id": 1,
                "status": 1,
                "price_per_tfn": 1,
                "purchase_date": 1,
                publisherName: { $arrayElemAt: ["$userdata.fullname", 0] }
            }

        }

    ];

    Tfn.aggregate(aggregateObj).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }
        return res.json({ tfn: data });
    }).catch(next);
}

tfn.getPendingTfns = (req, res, next) => {


    const aggregateObj = [

        {
            $match: { status: 'pending' }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'pub_id',
                foreignField: 'uid',
                as: 'userdata'
            }
        },
        { $sort: { purchase_date: -1 } },
        {
            $project:
            {

                "tfn_id": 1,
                "tfn": 1,
                "pub_id": 1,
                "status": 1,
                "price_per_tfn": 1,
                "purchase_date": 1,
                publisherName: { $arrayElemAt: ["$userdata.fullname", 0] }
            }

        }

    ];

    Tfn.aggregate(aggregateObj).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }
        return res.json({ tfn: data });
    }).catch(next);
}

tfn.getTfn = (req, res, next) => {

    let query = {};
    if (req.params.pub_id) {
        query = { pub_id: req.params.pub_id, status: { $ne: 'inactive' } };
    } else if (req.params.buyer_id) {
        query = { buyer_id: req.params.buyer_id, status: { $ne: 'inactive' } };
    } else if (req.params.id) {
        query = { _id: mongoose.Types.ObjectId(req.params.id) };
    } else {
        query = { tfn: req.params.tfn, status: { $ne: 'inactive' } };
    }

    Tfn.find(query).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ tfn: data });
    }).catch(next);

}

tfn.getAvailableTfn = (req, res, next) => {
    Tfn.find({ status: 'available' }).then(data => {
        if (!data) { return res.sendStatus(422); }
        return res.json({ tfn: data });
    }).catch(next);

}


tfn.updatePublisher = (req, res, next) => {
    let updatevalue = {};
    function oldTfns(tfn) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE `asterisk`.`incoming` set destination='app-blackhole,hangup,1' WHERE extension LIKE '%" + tfn + "%'",
                (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                        console.log("update1 tfn while assign the publisher");
                    }
                }
            );
        });
    }

    if (req.body.pub_id != undefined) {
        updatevalue.pub_id = req.body.pub_id
    }
    if (req.body.status) {
        updatevalue.status = req.body.status;
    }
    if (req.body.buyer_id > 0) {
        updatevalue.buyer_id = req.body.buyer_id;
    }
    if (req.body.purchase_date) {
        updatevalue.purchase_date = req.body.purchase_date;
    }
    if (req.body.charge_per_minute || req.body.charge_per_minute >= 0) {
        updatevalue.charge_per_minute = req.body.charge_per_minute;
    }

    const query = {
        _id: mongoose.Types.ObjectId(req.params.id)
    },
        update = {
            $set: updatevalue
        },
        options = {
            new: false,
            upsert: false,
            overwrite: false,
        }
    Tfn.findOne(query).then(data2 => {
        if (data2.pub_id !== req.body.pub_id) {
            oldTfns(data2.tfn);
        }
        Tfn.findByIdAndUpdate(query, update, options).then(data => {

            if (!data) { return res.sendStatus(422); }

            return res.json({ tfn: data });
        }).catch(next);
    })
        .catch(next);

}



tfn.addTfn = async (req, res, next) => {

    function addTfns(value, check) {

        return new Promise((resolve, reject) => {

            let tfn = new Tfn();

            // tfn.buyer_id = req.body.buyer_id;
            // tfn.pub_id = req.body.pub_id;
            tfn.tfn = value;
            tfn.price_per_tfn = req.body.price_per_tfn || 0;
            tfn.status = req.body.status || "available";
            tfn.pub_id = req.body.pub_id || 0;

            //tfn.purchase_date = Date.now();
            tfn.save().then(data => { //create email verification tokenand update user data with the email verification token

                if (!data) { return res.sendStatus(422); }
                if (check) {
                    console.log('call after all tfns added on both sides');
                    serverCall();
                }
                resolve(data);
            }).catch(next);

        }).catch(err => {
            reject(err);
        });

    }

    function checkTfns(value, check) {

        return new Promise((resolve, reject) => {

            Tfn.findOne({ tfn: value }).then(async response => {

                if (response == null) {

                    const newObj = await addTfns(value, check);
                    if (newObj == null) { return res.sendStatus(422); }
                    resolve(newObj);
                } else {
                    resolve(response);
                }
            }).catch(err => {
                reject(err);
            });

        });


    };
    for (let i = 0; i < req.body.tfn.length; i++) {
        let check = false;
        if (i === (req.body.tfn.length - 1)) {
            check = true;
        }
        const newObj = await checkTfns(req.body.tfn[i], check);
        if (newObj == null) { return res.sendStatus(422); }

        //sendEmail(req.body.email);
    }
    return res.json({ success: 'OK' });
}
/* Checking the publisher limit ot buy before buying the TFN */
tfn.checkTfn = (req, res, next) => {
    const user = req.body.user;

    UserSettings.findOne({ pub_id: user.uid }).then(data => {
        const userSettings = data;
        /* Monthly limit  */
        currentDate = new Date();
        sdate = new Date(currentDate.getFullYear(), currentDate.getMonth());
        ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");

        edate = new Date(currentDate.getFullYear(), (currentDate.getMonth() + 1), 0);
        eedate = moment(edate).format("YYYY-MM-DD 23:59:59");
        if (req.body.tfn.length > userSettings.daily_tfns) {
            return res.json({ success: 'NOK', message: 'Your are selecting more tfn(s) than your daily limit(of ' + userSettings.daily_tfns + ') to buy.' });
        }
        /* monthly tfn limit check */
        Tfn.find({ purchase_date: { $gte: ssdate, $lte: eedate }, pub_id: user.uid }).then(data => {
            if (data.length >= userSettings.monthly_tfns) {
                return res.json({ success: 'NOK', message: 'Your monthly tfn(s) buy limit is over.' });
            } else {
                /* Daily TFN limit */
                sdate = new Date();
                ssdate = moment(sdate).format("YYYY-MM-DD 00:00:00");
                edate = new Date();
                eedate = moment(edate).format("YYYY-MM-DD 23:59:59");

                Tfn.find({ purchase_date: { $gte: ssdate, $lte: eedate }, pub_id: user.uid }).then(data2 => {
                    if (data2.length >= userSettings.daily_tfns) {
                        return res.json({ success: 'NOK', message: 'Your daily tfn(s) buy limit is over.' });
                    } else {
                        return res.json({ success: 'OK' });
                    }
                }).catch(next);
            }
        }).catch(next);
    }).catch(next);
}


tfn.buyTfn = (req, res, next) => {
    const user = req.body.user;
    const userSettings = req.body.userSettings;
    let purchase_date = new Date();
    purchase_date = moment(purchase_date).format('YYYY-MM-DD HH:mm:ss');
    const options = {
        upsert: false,
        new: false
    };

    req.body.tfn.forEach(async (t, index) => {
        await Tfn.findOneAndUpdate({ tfn: t }, { status: 'pending', pub_id: user.uid, purchase_date: purchase_date }, options).then(data => {
            return 1;
        }).catch(next);
    });
    return res.json({ success: 'OK' });
}

tfn.deleteTfn = (req, res, next) => {
    function deleteDB(tfn) {
        const query = `DELETE FROM incoming WHERE extension like '` + tfn + `';`;
        console.log(query);
        db.query(query, (err, res) => {
            if (err) {
                console.log(err);
            };
            serverCall();
            console.log(`tfn deleted asterisk`, res);
        });
    }
    Tfn.findById(req.params.id).then(async (data) => {
        if (!data) { return res.sendStatus(422); }
        await deleteDB(data.tfn);
        data.remove();
        return res.json({ success: 'OK', message: "TFN is permanently deleted successfully!" });
    }).catch(next);
}

tfn.prishi = (req, res, next) => {
    Tfn.deleteMany({}).then(d => {
        res.send('p');
    });
}

tfn.tfnapi = (req, res, next) => {
    const options = {
        method: 'POST',
        uri: 'http://66.185.29.98/apis/create_ir.php',
        form: {
            token: 'rQS0CGHlS39x1XmwEwgLJKKjPExjLH',
            operation: 'add',
        },
    };
    return request(options)
        .then(data => {
            console.log(data);
            res.send(data);
        }).catch((e) => {
            res.json({ err: e });
        });
}


tfn.addTfn2 = async (req, res, next) => {
    function addTFNServer(tfn){
        const url = 'http://'+tfn.server_ip+'/apis/create_ir.php'
        const options = {
            method: 'POST',
            uri: url,
            form: {
                token: 'rQS0CGHlS39x1XmwEwgLJKKjPExjLH',
                operation: 'add',
            },
        };
        return request(options)
            .then(data => {
                return data;
            }).catch((e) => {
                return e;
            });
    }
    function coreReload(ip){
        const url = 'http://'+ip+'/apis/create_ir.php'
        const options = {
            method: 'POST',
            uri: url,
            form: {
                token: 'rQS0CGHlS39x1XmwEwgLJKKjPExjLH',
                operation: 'reload',
            },
        };
        return request(options)
            .then(data => {
                return data;
            }).catch((e) => {
                return e;
            });
    }
    function addTfns(value, check) {

        return new Promise((resolve, reject) => {

            let tfn = new Tfn();

            // tfn.buyer_id = req.body.buyer_id;
            // tfn.pub_id = req.body.pub_id;
            tfn.server_ip = req.body.server_ip || 0;
            tfn.tfn = value;
            tfn.price_per_tfn = req.body.price_per_tfn || 0;
            tfn.status = req.body.status || "available";
            tfn.pub_id = req.body.pub_id || 0;

            //tfn.purchase_date = Date.now();
            tfn.save().then(data => { //create email verification tokenand update user data with the email verification token

                if (!data) { return res.sendStatus(422); }

                addTFNServer();
                if (check) {
                    console.log('call after all tfns added on both sides');
                   // serverCall(); coreReload(req.body.server_ip);
                }
                resolve(data);
            }).catch(next);

        }).catch(err => {
            reject(err);
        });

    }

    function checkTfns(value, check) {

        return new Promise((resolve, reject) => {

            Tfn.findOne({ tfn: value }).then(async response => {

                if (response == null) {

                    const newObj = await addTfns(value, check);
                    if (newObj == null) { return res.sendStatus(422); }
                    resolve(newObj);
                } else {
                    resolve(response);
                }
            }).catch(err => {
                reject(err);
            });

        });


    };
    for (let i = 0; i < req.body.tfn.length; i++) {
        let check = false;
        if (i === (req.body.tfn.length - 1)) {
            check = true;
        }
        const newObj = await checkTfns(req.body.tfn[i], check);
        if (newObj == null) { return res.sendStatus(422); }

        //sendEmail(req.body.email);
    }
    return res.json({ success: 'OK' });
}
module.exports = tfn;
