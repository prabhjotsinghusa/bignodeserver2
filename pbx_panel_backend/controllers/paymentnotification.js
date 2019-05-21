var mongoose = require('mongoose');
var PaymentNotification = mongoose.model('Payment_Notification');

var paymentnotification = {};


paymentnotification.getAll = (req, res, next) => {
    let str = {};
    if (req.query.status) {
        str.status = parseInt(req.query.status);
    }
    console.log(str);
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
        }, {
            $sort: { _id: -1 }
        },
        {
            $project:
            {
                "pub_id": 1,
                "status": 1,
                "createdAt": 1,
                publisherName: { $arrayElemAt: ["$userdata.fullname", 0] }
            }

        }
    ];
    if (req.query.limit) {
        aggregateObj.push({ $limit: parseInt(req.query.limit) });
    }

    PaymentNotification.aggregate(aggregateObj).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }
        return res.json({ paymentnotification: data });
    }).catch(next);
}

paymentnotification.getCount = (req, res, next) => {
    let str = {};
    if (req.query.status) {
        str.status = parseInt(req.query.status);
    }
    if (req.query.pub_id) {
        str.pub_id = parseInt(req.query.pub_id);
    }

    PaymentNotification.find(str).then(data => {
        if (!data) {
            return res.sendStatus(422);
        }
        return res.json({ notification_count: data.length });
    }).catch(next);
}
paymentnotification.add = (req, res, next) => {

    if (req.query.pub_id) {
        const pub_id = parseInt(req.query.pub_id);
        let notification = new PaymentNotification();
        notification.pub_id = pub_id;
        notification.status = 1;
        notification.save().then(data => {
            if (!data) return res.sendStatus(422);
            return res.json({ notification: data });
        }).catch(next);
    } else{
        return res.json({error:'No publisher found.'});
    }
}
module.exports = paymentnotification;
