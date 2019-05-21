const Buyer_Number = require('../models/buyer_number.model');

module.exports = {
    find(req, reply) {

        return Buyer_Number.aggregate([
            {
                $match: { number: req.query.number }
            },
            {
                $lookup: {
                    from: 'buyers',
                    localField: 'buyer_id',
                    foreignField: 'buyer_id',
                    as: 'buyerdata'
                }
            }, {
                $project: {
                    number: 1,
                    buyer_id: 1,
                    buyerName: { $arrayElemAt: ["$buyerdata.name", 0] }
                }
            }
        ]).exec().then(data => {
            if (!data) {
                return reply.sendStatus(422);
            }
            return { data: data };
        }).catch((err) => {

            return { err: err };

        });
    },
    get(req, reply) {

        return Buyer_Number.findOne({ number: req.query.number }).exec().then(data => {
            if (!data) {
                return reply.sendStatus(422);
            }
            return { data: data };
        }).catch((err) => {
            return { err: err };
        });
    }
}
