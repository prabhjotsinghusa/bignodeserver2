var mongoose = require('mongoose');
var Tfn = mongoose.model('Tfn');
var tfndetails = {};


tfndetails.getDetails = (req, res, next) => {
    console.log(req.query);
    let str = { tfn: req.query.tfn };


    const aggregateObj = [
        {
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
                from: 'camp_pub_tfns',
                localField: 'tfn',
                foreignField: 'tfn',
                as: 'camp_pub_data'
            }
        },
        {
            $unwind: "$camp_pub_data"
        },
        {
            $lookup: {
                from: 'camp_buyer_tfns',
                localField: 'camp_pub_data.camp_id',
                foreignField: 'camp_id',
                as: 'camp_buyer_data'
            }
        },
        {
            $lookup: {
                from: 'user_settings',
                localField: 'pub_id',
                foreignField: 'pub_id',
                as: 'user_settings'
            }
        },
        {
            $project:
            {
                tfn: 1,
                pub_id: 1,
                status: 1,
                //"price_per_tfn": 1,
                publisherName: { $arrayElemAt: ["$userdata.fullname", 0] },
                publisherSettings: { $arrayElemAt: ["$user_settings", 0] },
                pub_price_per_tfn: { $arrayElemAt: ["$userdata.price_per_tfn", 0] },
                camp_id: "$camp_pub_data.camp_id",
                buyerData: "$camp_buyer_data",
            }

        }
    ];

    Tfn.aggregate(aggregateObj).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }
        return res.json({ tfndetails: data });
    }).catch(next);
}

tfndetails.getOne = (req, res, next) => {
    let str = { tfn: req.query.tfn };


    const aggregateObj = [
        {
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
                from: 'camp_pub_tfns',
                localField: 'tfn',
                foreignField: 'tfn',
                as: 'camp_pub_data'
            }
        },
        {
            $unwind: "$camp_pub_data"
        },
        {
            $lookup: {
                from: 'camp_buyer_tfns',
                localField: 'camp_pub_data.camp_id',
                foreignField: 'camp_id',
                as: 'camp_buyer_data'
            }
        },
        {
            $lookup: {
                from: 'user_settings',
                localField: 'pub_id',
                foreignField: 'pub_id',
                as: 'user_settings'
            }
        },
        {
            $project:
            {
                tfn: 1,
                pub_id: 1,
                status: 1,
                //"price_per_tfn": 1,
                publisherName: { $arrayElemAt: ["$userdata.fullname", 0] },
                publisherSettings: { $arrayElemAt: ["$user_settings", 0] },
                pub_price_per_tfn: { $arrayElemAt: ["$userdata.price_per_tfn", 0] },
                camp_id: "$camp_pub_data.camp_id",
                buyerData:{
                    $filter: {
                        input:"$camp_buyer_data",
                        as:"bn",
                        cond:{ $eq: ["$$bn.buyers_no",req.query.buyers_no] }
                        }
                }
            }

        }
    ];

    Tfn.aggregate(aggregateObj).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }
        return res.json({ tfndetails: data });
    }).catch(next);
}

module.exports = tfndetails;
