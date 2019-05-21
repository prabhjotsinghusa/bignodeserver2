const Tfn = require('../models/tfn.model');
module.exports = {
    find(req, reply) {
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
            { '$lookup': { from: 'campaigns', localField: 'camp_pub_data.camp_id', foreignField: 'campaign_id', as: 'campaigndata' } }, 
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
                    charge_per_minute:1,
                    publisherName: { $arrayElemAt: ["$userdata.fullname", 0] },
                    publisherSettings: { $arrayElemAt: ["$user_settings", 0] },
                    pub_price_per_tfn: { $arrayElemAt: ["$userdata.price_per_tfn", 0] },
                    camp_id: "$camp_pub_data.camp_id",
                    buyerData: "$camp_buyer_data",
                    campaigndata: { '$arrayElemAt': [ '$campaigndata', 0 ] }
                }

            }
        ];


        return Tfn.aggregate(aggregateObj).exec().then(data => {
            if (!data) {
                return reply.sendStatus(422);
            }
            return { tfndetails: data };

        }).catch((err) => {

            return { err: err };

        });
    },
}