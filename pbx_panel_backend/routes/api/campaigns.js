
const router = require('express').Router();
const auth = require('../auth');
const campaign = require('../../controllers/campaigns');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.post('/Campaign/add', auth.required, campaign.addCampaign);

router.post('/Campaign/edit/:campaignId', auth.required, campaign.editCampaign);

router.get('/Campaign/getAll',auth.required, campaign.getCampaign);

router.get('/Campaign/getCamp/:pubId', auth.required, campaign.getPubCampaign);

router.get('/Campaign/getCampaignByCampaignId/:campaignId',auth.required, campaign.getCampaign);

router.get('/Campaign/getCampPubTfns/:camp_id',auth.required, campaign.getCampPubTfns);

router.get('/Campaign/getCampBuyerTfns/:camp_id',auth.required, campaign.getCampBuyerTfns);

router.get('/Campaign/getAllIvrDetails',auth.required, campaign.getAllIvrDetails);

// router.put('/Campaign/update/:id', auth.required, campaign.updateActiveHour);

router.delete('/Campaign/delete/:campaignId',auth.required,campaign.deleteCampaign);

module.exports = router;
