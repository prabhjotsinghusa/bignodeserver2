var mongoose = require('mongoose');
var User = mongoose.model('User');
var PublisherKey = mongoose.model('PublisherKey');
var Buyer = mongoose.model('Buyer');
var Tfn = mongoose.model('Tfn');
var UserSettings = mongoose.model('User_Settings');
var AssignedPublishers = mongoose.model('Assigned_Publisher');
var _ = require('underscore');

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

var user = {};


user.getPublishers = (req, res, next) => {

    User.find({
        role: 'publisher',
        status: {
            $ne: 'deleted'
        }
    }).then(function (data) {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            user: data
        });
    }).catch(next);
}


user.getDashboardPublishers = (req, res, next) => {
    User.countDocuments({}).then((data) => {
        return res.json({
            totalPublishers: data
        });
    }).catch(next);
}


user.getAuditers = (req, res, next) => {

    User.find({
        role: 'audit_profile',
        status: {
            $ne: 'deleted'
        }
    }).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            user: data
        });
    }).catch(next);
}

user.addPublisher = (req, res, next) => {

    let user = new User();

    user.username = req.body.email.split('@')[0] + generateRandomString(true, 4) + '@pbx4you.com',
        user.fullname = req.body.fullname,
        user.email = req.body.email,
        user.contact = req.body.contact,
        user.password = encodeMD5(req.body.password),
        user.created_at = Date.now(),
        user.role = req.body.role,
        user.status = "active",
        user.price_per_tfn = req.body.price_per_tfn,
        user.pub_queue = req.body.pub_queue

    //console.log(req.body, "check body");
    user.save().then(data => { //create email verification tokenand update user data with the email verification token

        let userSettings = new UserSettings();
        //  console.log(data, userSettings, '+++++++++++++++++++++++');
        userSettings.pub_id = data.uid;
        userSettings.save().then(usersettings => { //Check Email Exists or not

            let mailOptions = {
                from: 'support@pbx4you.com',
                to: data.email,
                subject: 'Thankyou for signing up with pbx4you.com',
                template: 'user',
                context: {
                    username: data.username,
                    link: 'http://alpha.pbx4you.com',
                    email: data.email,
                    password: req.body.password
                }
            };

            sendEmail(mailOptions);


            // const str = "sshpass -p '!$@DeM0$((.!7$!' ssh -o StrictHostKeyChecking=no root@103.115.35.17 /var/lib/asterisk/bin/module_admin reload";
            /*    const str = "sshpass -p 'wP9j@Y$?PBX?$%kCN5@C' ssh -o StrictHostKeyChecking=no root@66.185.29.98 /var/lib/asterisk/bin/module_admin reload";
               exec(str, (e, stdout, stderr) => {
                   if (e instanceof Error) {
                       console.error(e);
                       throw e;
                   }
                   console.log('stdout ', stdout);
                   console.log('stderr ', stderr);
               }); */
            serverCall();

            return res.json({
                user: usersettings
            });

        });


    }).catch(next);

}

user.editPublisher = (req, res, next) => {

    if (req.params) {

        User.findOne({
            uid: req.params.uid
        }).then(function (user) {

            if (!user) {
                return res.json({
                    profile: req.profile.toProfileJSONFor(false)
                });

            } else {
                let query = {
                    uid: req.params.uid
                },
                    update = {
                        fullname: req.body.fullname,
                        email: req.body.email,
                        contact: req.body.contact,
                        price_per_tfn: req.body.price_per_tfn,
                        pub_queue: req.body.pub_queue,
                        status: req.body.status
                    },
                    options = {
                        upsert: false,
                        new: false,
                        overwrite: false,
                    };
                if (req.body.password) {
                    update.password = encodeMD5(req.body.password);
                }

                User.findOneAndUpdate(query, update, options).then(data => {

                    if (req.body.password) {

                        /* sending the password on email */
                        let mailOptions = {
                            from: 'support@pbx4you.com',
                            to: data.email,
                            subject: 'Your password is changed on the pbx4you.com',
                            template: 'reset',
                            context: {
                                username: data.username,
                                link: 'http://alpha.pbx4you.com',
                                email: data.email,
                                password: req.body.password
                            }
                        };
                        sendEmail(mailOptions);
                    }
                    return res.json({
                        user: data
                    });
                }).catch(next);
            }
        });
    } else {
        return res.json({
            profile: req.profile.toProfileJSONFor(false)
        });
    }
}

user.editPublisherSettings = (req, res, next) => {
    function shellcode() {
        /* shell script code */
        serverCall();
    }
    if (req.params) {

        UserSettings.findOne({
            pub_id: req.params.uid
        }).then(user => {
            // console.log(user, "+++++");

            if (!user) {
                let userSettings = new UserSettings();

                userSettings.pub_id = req.params.uid;
                userSettings.enabled_record = req.body.enabled_record;
                userSettings.daily_tfns = req.body.daily_tfns;
                userSettings.monthly_tfns = req.body.monthly_tfns;
                userSettings.display_cnum = req.body.display_cnum;
                userSettings.display_wallet = req.body.display_wallet;
                userSettings.phone_system = req.body.phone_system;
                userSettings.call_reducer = req.body.call_reducer;
                userSettings.enable_inside_route = req.body.enable_inside_route;
                userSettings.enable_outside_route = req.body.enable_outside_route;
                userSettings.buyer_limit = req.body.buyer_limit;
                userSettings.usage_module = req.body.usage_module;
                userSettings.filtered = req.body.filtered;
                userSettings.number_to_ivr = req.body.number_to_ivr;
                userSettings.show_buyer_no = req.body.show_buyer_no;
                userSettings.hide_campaign = req.body.hide_campaign;
                userSettings.charge_per_minute = req.body.charge_per_minute;

                userSettings.save().then(usersettings => { //Check Email Exists or not
                    shellcode();
                    return res.json({
                        settings: usersettings
                    });

                })
            } else {

                let query = {
                    pub_id: req.params.uid
                },
                    update = {

                        enabled_record: req.body.enabled_record,
                        daily_tfns: req.body.daily_tfns,
                        monthly_tfns: req.body.monthly_tfns,
                        display_cnum: req.body.display_cnum,
                        display_wallet: req.body.display_wallet,
                        phone_system: req.body.phone_system,
                        call_reducer: req.body.call_reducer,
                        enable_inside_route: req.body.enable_inside_route,
                        enable_outside_route: req.body.enable_outside_route,
                        buyer_limit: req.body.buyer_limit,
                        usage_module: req.body.usage_module,
                        filtered: req.body.filtered,
                        number_to_ivr: req.body.number_to_ivr,
                        show_buyer_no: req.body.show_buyer_no,
                        hide_campaign: req.body.hide_campaign,
                        charge_per_minute: req.body.charge_per_minute
                    },
                    options = {
                        upsert: false,
                        new: true
                    };

                UserSettings.findOneAndUpdate(query, update, options).then(data => {
                    shellcode();
                    return res.json({
                        settings: data
                    });
                }).catch(next);
            }
        });
    } else {
        return res.json({
            profile: req.profile.toProfileJSONFor(false)
        });
    }
}

user.getPublishersSettings = (req, res, next) => {

    UserSettings.findOne({
        pub_id: req.params.uid
    }).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            settings: data
        });

    }).catch(next);

}

user.getPublisher = (req, res, next) => {

    User.findOne({
        uid: req.params.uid
    }).then(function (data) {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            user: data
        });
    }).catch(next);
}


user.getActivePublishers = (req, res, next) => {

    User.find({
        role: 'publisher',
        status: 'active'
    }).then(function (data) {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.json({
            user: data
        });
    }).catch(next);
}

user.deletePublisher = (req, res, next) => {
    if (req.params) {
        let query = {
            uid: req.params.uid
        },
            update = {
                status: 'deleted',
                isDeleted: true
            },
            options = {
                upsert: false,
                new: false
            };
        /* Deleting the assigned publishers from audit profiles */
        AssignedPublishers.deleteMany({
            pub_id: req.params.uid
        }).then(data => { }).catch(next);
        User.findOneAndUpdate(query, update, options).then((data) => {

            return res.json({
                user: data
            });

        }).catch(next);

    } else {
        return res.json({
            success: 'NOK'
        });
    }
}

user.deleteAuditer = (req, res, next) => {
    if (req.params) {
        User.findOne({
            uid: req.params.uid,
            role: 'audit_profile'
        }).then(user => {
            if (!user) {
                return res.json({
                    profile: req.profile.toProfileJSONFor(false)
                });
            } else {
                AssignedPublishers.deleteMany({
                    audit_profile_id: req.params.uid
                }).then(data => {
                    if (data) {
                        user.remove();
                        res.json({
                            success: 'OK',
                            message: 'Audit profile deleted successfully.'
                        });
                    }
                }).catch(next);
            }
        }).catch(next);
    } else {
        return res.json({
            profile: req.profile.toProfileJSONFor(false)
        });
    }
}


user.getAssignedPublishers = (req, res, next) => {

    let arr = [];

    function pushAssignedUsers(value) {

        return new Promise((resolve, reject) => {

            User.findOne({
                uid: value.pub_id
            }).then(response => {

                if (response != null) {

                    let ob = {};
                    ob.status = value.status;
                    ob.pub_id = value.pub_id;
                    ob.audit_profile_id = value.audit_profile_id;
                    ob.fullname = response.fullname;
                    resolve(ob);
                }
            }).catch(err => {
                reject(err);
            });
        });


    };
    AssignedPublishers.find({
        audit_profile_id: req.params.audit_profile_id
    }).then(async data => {

        if (!data) {
            return res.sendStatus(422);
        }

        for (let i = 0; i < data.length; i++) {
            const newObj = await pushAssignedUsers(data[i]);
            arr.push(newObj);

        }
        return res.json({
            user: arr
        });
    }).catch(next);
}

user.addAssignedPublisher = (req, res, next) => {

    let arr = [];
    AssignedPublishers.remove({
        audit_profile_id: req.body.audit_profile_id
    }).then(data2 => {

        req.body.pub_id.forEach(pubId => {
            AssignedPublishers.find({
                audit_profile_id: req.body.audit_profile_id
            }).then(data => {

                let assigned_publisher = new AssignedPublishers();
                assigned_publisher.pub_id = pubId;
                assigned_publisher.audit_profile_id = req.body.audit_profile_id;

                assigned_publisher.save().then(data => { //create email verification tokenand update user data with the email verification token
                    arr.push(data);
                    if (!data) {
                        return res.sendStatus(422);
                    }

                }).catch(next);
            }).catch(next);
        });


    }).catch(err => {
        console.log(err)
    });
    res.json({
        success: 'OK'
    });
}

user.updateProfile = (req, res, next) => {
    let query = {
        uid: req.params.uid
    },
        update = {
            fullname: req.body.fullname,
            email: req.body.email,
            contact: req.body.contact,
        },
        options = {
            upsert: false,
            new: false
        };
    User.findOneAndUpdate(query, update, options).then((data) => {
        return res.json({
            user: data
        });
    }).catch(next);
}

user.updatePassword = (req, res, next) => {
    let query = {
        uid: req.params.uid,
        password: encodeMD5(req.body.old_passwd)
    },
        update = {
            password: encodeMD5(req.body.passwd),
        },
        options = {
            upsert: false,
            new: false
        };
    User.findOneAndUpdate(query, update, options).then((data) => {
        if (!data) {
            return res.json({
                success: 'NOK',
                message: 'Old password is incorrect.'
            });
        }
        return res.json({
            success: 'OK',
            user: data
        });
    }).catch(next);
}

user.sendemail = (req, res, next) => {
    let query = {
        uid: req.params.uid,
    };
    User.findOne(query).then(data => {
        if (!data) {
            return res.json({
                success: 'NOK',
                message: 'user not found.'
            });
        }

        var mailOptions = {
            from: 'support@pbx4you.com',
            to: 'geek.sem83@gmail.com',
            subject: 'Sending Email using Node.js',
            template: 'user',
            context: {
                username: data.username,
                link: 'http://alpha.pbx4you.com',
                email: data.email,
                password: 'manish@123'
            }
        };

        sendEmail(mailOptions);
        return res.json({
            success: 'OK',
            user: data
        });
    }).catch(next);
}
/* get user and user settings directly */

user.getDirect = (req, res, next) => {
    User.aggregate([{
        $match: {
            username: req.query.email
        }
    },
    {
        $lookup: {
            from: 'user_settings',
            localField: 'uid',
            foreignField: 'pub_id',
            as: 'userSettings'
        }
    }, {
        $project: {
            "uid": 1,
            "username": 1,
            "fullname": 1,
            "email": 1,
            "contact": 1,
            "role": 1,
            "created_at": 1,
            "status": 1,
            "price_per_tfn": 1,
            "pub_queue": 1,
            "user_settings": {
                '$arrayElemAt': ['$userSettings', 0]
            }
        }
    }
    ]).then(data => {
        if (!data) {
            return sendStatus(422);
        }
        res.json({
            user: data
        });
    }).catch(next);
}
/* get server time */

user.getTime = (req, res, next) => {
    process.env.TZ = 'America/Chicago';
    const t = new Date();
    res.json({
        date: t,
        time: t.getTime()
    });
}

user.addPublisherKey = (req, res, next) => {
    function addKey() {

        return new Promise((resolve, reject) => {
            let publisherKey = new PublisherKey();
            publisherKey.key = generateRandomString(true, 16),
                publisherKey.pub_id = req.query.pub_id,

                publisherKey.save().then(data => {
                    resolve(data);
                }).catch(err => {
                    reject(err);
                })
        });

    }

    PublisherKey.findOne({
        pub_id: parseInt(req.query.pub_id)
    }, {
            pub_id: 1,
            _id: 0
        }).then(async data => {
            if (data != null)
                return res.json({
                    success: 'NOK',
                    message: 'This publisher id already exists'
                });
            let result = await addKey(data);
            return res.json({
                success: 'OK',
                data: result
            });
        }).catch(next);

}

user.getTfnFromPublisherKey = (req, res, next) => {

    return new Promise((resolve, reject) => {

        PublisherKey.aggregate([{
            $match: {
                key: req.query.key
            }
        },
        {
            $lookup: {
                from: 'tfns',
                localField: 'pub_id',
                foreignField: 'pub_id',
                as: 'tfndata'
            }
        },
        {
            $unwind: '$tfndata'
        },
        {
            $project: {
                _id: 0,
                tfn: '$tfndata.tfn'
            }
        }
        ]).then(data => {

            if (!data.length)
                return res.json({
                    success: 'NOK',
                    message: 'Publisher key not found'
                });

            return res.json({
                success: 'OK',
                data: data
            });
        }).catch(err => {
            reject(err);
        })
    });


}

user.getPublisherName = (req, res, next) => {

    User.findOne({
        uid: req.params.uid,
        role: "publisher",
    }).select({ "fullname": 1, "_id": 0 }).then(function (data) {
        if (!data) {
            return res.sendStatus(422);
        }

        return res.send(data.fullname
        );
    }).catch(next);
}

user.getCallsByEmail = (req, res, next) => {

    let str = {};

    if (req.query.email) {
        str.username = req.query.email
    }

    const current = new Date();
    ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
    eedate = moment(current).format("YYYY-MM-DD 23:59:59");

    console.log(ssdate, eedate);

    User.aggregate(
        [
            {
                $match: str
            },
            {
                $lookup: {

                    from: 'cdrs',
                    localField: 'uid',
                    foreignField: 'pub_id',
                    as: 'cdrData'

                }
            },
            {
                $unwind: "$cdrData"
            },
            {
                $match: { "cdrData.start": { $gte: ssdate }, "cdrData.end": { $lte: eedate }, "cdrData.status": "show" }
            },
            {
                $group: { _id: null, count: { $sum: 1 } }
            },
            {
                $project: {
                    _id: 0,
                    count: { $toInt: "$count" }

                }
            }
        ]).then(data => {

            if (!data) {
                resolve(res.sendStatus(422))
            }
            console.log(data)
            return res.json({
                totalCalls: !data.length ? 0 : data[0].count,
                //  totalcalls: data.length
            });
        });
}





user.getUserDetailsById = (req, res, next) => {

    function getBuyerDetails(str) {

        return new Promise((resolve, reject) => {

            Buyer.find(str).then(data => {

                if (data == null) {
                    reject(err);

                }
                else if (data.length > 0) {

                    let dataArr = [];
                    data.forEach(val => {

                        let dataObj = {};
                        dataObj.email = val.email;
                        dataObj._id = val._id;
                        dataObj.name = val.name;
                        dataObj.role = "buyer";
                        dataArr.push(dataObj);

                    });

                    resolve(dataArr);
                }
                else {

                    let dataObj = {};
                    dataObj.buyer_id = data[0].buyer_id;
                    dataObj.name = data[0].name;
                    dataObj.email = data[0].email;
                    dataObj.role = "buyer";
                    resolve(dataObj);
                }


            });

        });
    }

    let str = {};

    if (req.params.id) {

        str._id = mongoose.Types.ObjectId(req.params.id)
    }


    User.find(str).then(async data => {

        console.log(data, "checkig data")

        if (data.length == 0) {
            const result = await getBuyerDetails(str);
            return res.json({ data: result[0] });
        }
        else if (data.length > 1) {

            let dataArr = [];
            data.forEach(val => {
                dataArr.push({ _id: val._id, role: val.role, email: val.username });
            });
            const result = await getBuyerDetails(str);
            let result2 = dataArr.concat(result);
            return res.json({ data: result2 });
        }
        else {
            //  data.role = data.role;
            let dataObj = {};

            dataObj.uid = data[0].uid;
            dataObj.fullname = data[0].fullname;
            dataObj.email = data[0].username;
            //dataObj.email = data[0].email;
            dataObj.role = data[0].role;

            return res.json({ data: dataObj });
        }


    });
}


user.getCallsByTfn = (req, res, next) => {

    let str = {},newArr=[];

    if (req.query.email) {
        str.username = req.query.email
    }

    const current = new Date();
    ssdate = moment(current).format("YYYY-MM-DD 00:00:00");
    eedate = moment(current).format("YYYY-MM-DD 23:59:59");

    console.log(ssdate, eedate);

    function getCallFromTfn(value) {

        return new Promise((resolve, reject) => {

            User.aggregate(
                [
                    {
                        $match: value
                    },
                    {
                        $lookup: {

                            from: 'tfns',
                            localField: 'uid',
                            foreignField: 'pub_id',
                            as: 'tfnData'

                        }
                    },
                    {
                        $unwind: "$tfnData"
                    },
                    {
                        $project: {
                            _id: 0,
                            tfn: "$tfnData.tfn",
                            

                        }
                    }
                ]).then(data => {

                    if (!data) {
                        resolve(res.sendStatus(422))
                    }
                    data.forEach(obj => {
                        newArr.push({ _id: obj.tfn, count: 0});
                    });

                    console.log(data,"========")
                    resolve(newArr);

                });

        })
    }


    User.aggregate(
        [
            {
                $match: str
            },
            {
                $lookup: {

                    from: 'tfns',
                    localField: 'uid',
                    foreignField: 'pub_id',
                    as: 'tfnData'

                }
            },
            {
                $unwind: "$tfnData"
            },
            {
                $lookup: {

                    from: 'cdrs',
                    localField: 'tfnData.tfn',
                    foreignField: 'did',
                    as: 'cdrData'

                }
            },
            {
                $unwind: "$cdrData"
            },
            {
                $match: { "cdrData.start": { $gte: ssdate }, "cdrData.end": { $lte: eedate }, "cdrData.status": "show" }
            },
            {
                $group: { _id: "$tfnData.tfn", count: { $sum: 1 } }
            },
            {
                $project: {
                    _id: 1,
                    count: { $toInt: "$count" }

                }
            }
        ]).then(async data => {

            if (!data) {
                resolve(res.sendStatus(422))
            }
           
            let callssd;
            if (!data.length) {
                callssd = await getCallFromTfn(str);
            }
            console.log(callssd,"---------")
            return res.json({

                callsPerTfn: !data.length ? callssd: data
            });
        });
}


module.exports = user;
