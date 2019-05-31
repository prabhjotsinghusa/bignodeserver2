const Campaign = require('../models/campaign.model');
const moment = require('moment');
module.exports = {
    getAll(req, reply, next) {
        const current = new Date();
        active_on_hour = moment(current).format("HH:00:00");
        active_off_hour = moment(current).format("HH:59:59");
        //eedate = 
        return Campaign.aggregate([
            { $match: { active_on: { $lte: active_on_hour }, active_off: { $gte: active_off_hour} } },
            {
                $lookup: {
                    from: 'camp_pub_tfns',
                    localField: 'campaign_id',
                    foreignField: 'camp_id',
                    as: 'tfnData'
                }
            }
        ]).exec().then(data => {
            return { data: data, time:current, active_on_hour: active_on_hour,active_off_hour:active_off_hour};
        }).catch(err => {

            return { err: err };

        });

    },

}