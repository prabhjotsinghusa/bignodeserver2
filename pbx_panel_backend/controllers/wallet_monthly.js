const mongoose = require('mongoose');
const PublisherFinance = mongoose.model('Publisher_Finance');
// const BuyerFinance = mongoose.model('Buyer_Finance');
const BuyerNumbers = mongoose.model('Buyer_Number');
const AdminTransaction = mongoose.model('Admin_Transaction');
const Deduction = mongoose.model('Deduction');
const PaymentNotification = mongoose.model('Payment_Notification');
const Cdr = mongoose.model('Cdr');
const async = require("async");
const Users = mongoose.model('User');

const wallet_monthly = {};

wallet_monthly.getPublishers = (req, res, next) => {
    function getSpecificPubBal(d) {
        let query = {
            did: {
                $ne: ''
            },
            lastapp: {
                $ne: 'Hangup'
            },
            dst: {
                $ne: 's'
            },
            camp_id: {
                $gt: 0
            },
            status: 'show'
        };
        query.start = { $gte: d.start_date, $lte: d.end_date };

        query.pub_id = d.pub_id;

        let aggregateData = [{
            $match: query
        },
        { '$lookup': { from: 'user_settings', localField: 'pub_id', foreignField: 'pub_id', as: 'settings' } },
        { '$lookup': { from: 'campaigns', localField: 'camp_id', foreignField: 'campaign_id', as: 'campaigndata' } },
        {
            '$project': {
                pub_id: 1,
                camp_id: 1,
                duration: 1,
                disposition: 1,
                src: 1,
                price_per_tfn: 1,
                charge_per_minute: 1,
                settings: { '$arrayElemAt': ['$settings', 0] },
                // campaigndata: { '$arrayElemAt': ['$campaigndata', 0] },
                buffer_time: { '$arrayElemAt': ['$campaigndata.buffer_time', 0] },
            }
        },
        {
            $group: {
                _id: { pub_id: '$pub_id', camp_id: '$camp_id' },
                settings: { '$first': '$settings' },
                //campaigndata: { $first: '$campaigndata' },
                total_calls: {
                    $sum: 1
                },
                payable_calls: {
                    $push: {
                        $cond:
                            [
                                { '$and': [{ '$eq': ['$disposition', 'ANSWERED'] }, { '$gt': ['$duration', '$buffer_time'] }] },
                                {
                                    src: '$src', disposition: '$dispositon', duration: '$duration', price_per_tfn: '$price_per_tfn',
                                    charge_per_minute: '$charge_per_minute', buffer_time: '$buffer_time'
                                }, false]
                    }
                }
            }
        }];
        function uniqueAll(arr, prop) {
            let a = [];
            return arr.filter(e => {
                if (a.indexOf(e.src) === -1) {
                    a = [...a, e.src];
                    return true;
                }
            });
        }

        function getAmount(data) {
            return new Promise((resolve, reject) => {
                let b = 0;
                data.map(d => {
                    const payable_calls = uniqueAll(d.payable_calls, 'src');
                    /* unique payable amount */
                    //console.log(payable_calls,'payable_calls');
                    payable_calls.map(pc => {
                        if (d.settings.charge_per_minute) {
                            let a = parseInt(pc.charge_per_minute);
                            if (!isNaN(a)) {
                                b += a * Math.ceil(pc.duration / 60);
                            }
                        } else {
                            let a = parseInt(pc.price_per_tfn);
                            if (!isNaN(a)) {
                                b += a;
                            }
                        }
                    });
                });
                console.log(b, 'total amount');
                resolve(b);
            });

        }


        function getTotalCalls() {
            return new Promise((resolve, reject) => {
                async.parallel({
                    wallet_monthly: function (callback) {
                        return PublisherFinance.aggregate(
                            [{
                                $match: {
                                    pub_id: d.pub_id,
                                    cron_status: 'complete'
                                }
                            },
                            { $sort: { _id: -1 } },
                            { $limit: 1 }
                            ], function (err, result) {
                                if (err) console.log(err);
                                return callback(null, result);
                            });
                    },
                    totaldeduction: function (callback) {
                        return Deduction.aggregate([{
                            $match: {
                                pub_id: d.pub_id,
                                deduction_date: { $gte: d.start_date, $lte: d.end_date },
                            }
                        },
                        {
                            $group: {
                                _id: "$pub_id",
                                count: {
                                    $sum: 1
                                },
                                total: {
                                    $sum: "$amount"
                                }
                            }
                        }], function (err, result) {
                            return callback(null, result)
                        });
                    },
                    totalpayment: function (callback) {
                        return AdminTransaction.aggregate([{
                            $match: {
                                pub_id: d.pub_id,
                                payment_date: { $gte: d.start_date, $lte: d.end_date },
                            }
                        },
                        {
                            $group: {
                                _id: "$pub_id",
                                count: {
                                    $sum: 1
                                },
                                total: {
                                    $sum: "$amount"
                                }
                            }
                        }], function (err, result) {
                            return callback(null, result)
                        });
                    }

                },
                    function (err, results) {
                        //console.log(results, "+++++++++++++++++")
                        resolve(results);
                    });
            });
        }

        return new Promise((resolve) => {
            Cdr.aggregate(aggregateData).then(async data => {
                const r = await getTotalCalls();
                r.total_amount = await getAmount(data);
                //console.log(r);
                resolve(r);
            });
        });
    }
    PublisherFinance.findOne({ cron_status: 'pending' }).then(async data => {
        if (!data) {
            return res.sendStatus(422);
        }
        const r = await getSpecificPubBal(data);
        let wallet_amount = -(r.total_amount);
        if (r.totalpayment.length > 0) {
            r.totalpayment.map(t => {
                wallet_amount += t.total;
            });

        }
        if (r.totaldeduction.length > 0) {
            r.totaldeduction.map(t => {
                wallet_amount += t.total;
            });
        }
        if (r.wallet_monthly.length > 0) {
            r.wallet_monthly.map(t => {
                wallet_amount += t.total_amount;
            });
        }
        data.cron_status = 'complete';
        data.total_amount = wallet_amount;
        data.save().then(d => {
            res.json({ data: r, wallet_amount: wallet_amount });
        }).catch(next);

    });
}

wallet_monthly.setPublishers = (req, res, next) => {

    Users.find({ role: 'publisher', status: 'active' }).then(users => {
        const monthly_date = moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD 00:00:00");
        let financeArr = [];
        users.forEach((element, index) => {
            PublisherFinance.findOne({ pub_id: element.uid, start_date: monthly_date }).then(data => {
                if (!data) {
                    const pubFinance = {};
                    pubFinance.pub_id = element.uid;
                    pubFinance.cal_year = moment().subtract(1, 'months').format("YYYY");
                    pubFinance.cal_month = moment().subtract(1, 'months').format("MM");
                    pubFinance.start_date = moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD 00:00:00");
                    pubFinance.end_date = moment().subtract(1, 'months').endOf('month').format("YYYY-MM-DD 23:59:59");
                    financeArr = [...financeArr, pubFinance];
                    if (index === users.length - 1) {
                        PublisherFinance.insertMany(financeArr).then(data => {
                            res.json({ data: 'Create the new rows' });
                        });
                    }
                }

            }).catch(next);
        });
    });
}

wallet_monthly.deletePublishers = (req, res, next) => {
    PublisherFinance.deleteMany({ cal_month: moment().subtract(2, 'months').format("MM") }).then(data => {
        res.json({ data: data });
    });
}


module.exports = wallet_monthly;