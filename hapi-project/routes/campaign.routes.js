const CampaignController = require('../controllers/campaign.controller');
module.exports = [
    {
        path: '/campaign/get',
        method:'GET',
        handler: CampaignController.getAll
    }
];