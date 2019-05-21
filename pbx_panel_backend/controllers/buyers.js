var mongoose = require('mongoose');
var passport = require('passport');
var Buyer = mongoose.model('Buyer');
var request = require('request-promise');
const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../Utilities/Utilities');

var buyer = {};


buyer.getDashboardBuyers = (req, res, next) => {

    let query = {};

    if (req.query.pub_id) {
        query.pub_id = parseInt(req.query.pub_id);
    }

    Buyer.countDocuments(query).then((data) => {
        return res.json({ totalBuyers: data });
    }).catch(next);
}



buyer.getBuyers = (req, res, next) => {

    let queryObj = {};

    if (req.params.pub_id) {
        queryObj = { pub_id: req.params.pub_id }
    }


    Buyer.find(queryObj).then(function (data) {
        if (!data) { return res.sendStatus(422); }

        return res.json({ buyer: data });
    }).catch(next);
}

buyer.addBuyer = (req, res, next) => {

    let buyer = new Buyer();

    buyer.pub_id = req.body.pub_id,
        buyer.address = req.body.address,
        buyer.name = req.body.name,
        buyer.email = req.body.email,
        buyer.contact = req.body.contact,
        buyer.password = encodeMD5(req.body.password),
        buyer.created_at = Date.now(),
        buyer.status = "active",
        buyer.price_per_call = req.body.price_per_call,
        buyer.buffer_time = req.body.buffer_time
    buyer.save().then(data => { //create email verification tokenand update user data with the email verification token

        return res.json({ buyer: data });
    }).catch(next);

}


buyer.editBuyer = (req, res, next) => {
    if (req.params) {
        Buyer.findOne({ buyer_id: req.params.buyerid }).then(buyer => {
            if (!buyer) {
                return res.json({ profile: req.profile.toProfileJSONFor(false) });

            } else {

                let query = {
                    buyer_id: req.params.buyerid
                },
                    update = {
                        pub_id: req.body.pub_id,
                        name: req.body.name,
                        email: req.body.email,
                        contact: req.body.contact,
                        price_per_call: req.body.price_per_call,
                        buffer_time: req.body.buffer_time,
                        address: req.body.address
                    },
                    options = {
                        upsert: false,
                        new: true
                    };
                if (req.body.password) {
                    update.password = encodeMD5(req.body.password);
                }

                Buyer.findOneAndUpdate(query, update, options).then(data => {

                    return res.json({ buyer: data });

                }).catch(next);
            }
        });
    } else {
        return res.json({ profile: req.profile.toProfileJSONFor(false) });
    }
}

buyer.updatePassword = (req, res, next) => {
    let query = {
        buyer_id: parseInt(req.params.buyerid),
        password: encodeMD5(req.body.old_passwd)
    },
        update = {
            password: encodeMD5(req.body.passwd),
        },
        options = {
            upsert: false,
            new: false,
            overwrite: false
        };


    Buyer.findOneAndUpdate(query, update, options).then(data => {
        if (!data) { return res.json({ success: 'NOK', message: 'Old password is incorrect.' }); }
        return res.json({ success: 'OK', buyer: data });
    }).catch(next);
}


buyer.getBuyer = (req, res, next) => {

    Buyer.findOne({ buyer_id: req.params.buyerid }).then(data => {
        if (!data) { return res.sendStatus(422); }

        return res.json({ buyer: data });
    }).catch(next);
}

buyer.deleteBuyer = (req, res, next) => {

    Buyer.deleteOne({ buyer_id: req.params.buyerid }).then(data => {

        if (!data) { return res.sendStatus(422); }

        return res.json({ statusCode: 200, message: "Buyer deleted successfully!" });

    }).catch(next);
}

buyer.getDirect = (req, res, next) => {

    Buyer.aggregate([

        { $match: { email: req.query.email } },
        {
            $lookup: {
                from: 'buyer_numbers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyerNumbers'
            }
        }, {
            $project: {
                "buyer_id": 1,
                "name": 1,
                "fullname": 1,
                "email": 1,
                "contact": 1,
                "pub_id": 1,
                "created_at": 1,
                "status": 1,
                "price_per_call": 1,
                "buffer_time": 1,
                "buyerNumbers": 1
            }
        }
    ]).then(data => {
        if (!data) { res.sendStatus(422); }
        res.json({ buyer: data });
    });

}

buyer.getDirect2 = (req, res, next) => {

    Buyer.aggregate([
        { $match: { name: { $regex: req.query.name, $options: 'i' } } },
        {
            $lookup: {
                from: 'buyer_numbers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyerNumbers'
            }
        }, {
            $project: {
                "buyer_id": 1,
                "name": 1,
                "fullname": 1,
                "email": 1,
                "contact": 1,
                "pub_id": 1,
                "created_at": 1,
                "status": 1,
                "price_per_call": 1,
                "buffer_time": 1,
                "buyerNumbers": 1
            }
        }
    ]).then(data => {
        if (!data) { res.sendStatus(422); }
        res.json({ buyer: data });
    })
}


buyer.getBuyerDetailById = (req, res, next) => {

    Buyer.findOne({ _id: req.params.id }).then(data => {

        if (!data) { res.sendStatus(422); }
        res.json({ buyer: data });

    });
}


buyer.getBuyerDetailByEmail = (req, res, next) => {


    let queryObj = {}, result3 = [];

    if (req.query.email) {
        queryObj.email = req.query.email;
    }

    var options = {

        "method": "GET",
        "rejectUnauthorized": false,
        "url": 'https://client.pbx4you.com:8444/realtime/getBuyer2',
        "headers": {
            "Content-Type": "application/json",
        }
    };

    function fetchTotalCalls(dataArr) {


        return new Promise((resolve, reject) => {

            request(options)
                .then(resArr => {

                    JSON.parse(resArr).data.filter(o1 => {
                        dataArr.forEach(o2 => {
                            if (o1.key == o2.number) {

                                let obj = {};
                                obj[o1.key] = o1.total;
                                result3.push(obj);

                            }
                        });
                    });
                    resolve(result3);
                }).catch(err => {
                    reject(err);
                });
        });
    }

    Buyer.aggregate([
        {

            $match: queryObj

        },
        {
            $lookup: {
                from: 'buyer_numbers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyerdata'
            }
        },
        {
            $unwind: "$buyerdata"
        },
        {
            $project: {
                "number": "$buyerdata.number"
            }
        }
    ]).then(async data => {

        if (!data) { res.sendStatus(422); }
        const totalCalls = await fetchTotalCalls(data);
        res.json(totalCalls);
    });
}



buyer.getBuyerNumbers = (req, res, next) => {


    let queryObj = {};

    if (req.query.email) {
        queryObj.email = req.query.email;
    }

    Buyer.aggregate([
        {

            $match: queryObj

        },
        {
            $lookup: {
                from: 'buyer_numbers',
                localField: 'buyer_id',
                foreignField: 'buyer_id',
                as: 'buyerdata'
            }
        },
        {
            $unwind: "$buyerdata"
        },
        {
            $project: {
                "number": "$buyerdata.number"
            }
        }
    ]).then(async data => {



        if (!data) { res.sendStatus(422); }

        // const totalCalls = await fetchTotalCalls(data);
        // const totalBuyerNUmbers= await fetchTotalBuyerNUmbers(data);

        res.json(data);

    });
}

module.exports = buyer;
