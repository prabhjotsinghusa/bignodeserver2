
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
const cdrs = require('../../controllers/cdrs');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');


router.get('/getAllCdrs/:sdate/:edate', cdrs.getAllCdrs);
router.get('/getAgentReport', cdrs.getAgentReport);
router.get('/getAllCdrs', cdrs.getAllCdrs);
router.get('/getTotalCalls', cdrs.getTotalCalls);
router.get('/getTotalUniquieCalls/:sdate/:edate', cdrs.getTotalUniquieCalls);
router.get('/getTotalUniquieCalls', cdrs.getTotalUniquieCalls);
router.get('/getAgentTotalUniquieCalls/:sdate/:edate', cdrs.getAgentTotalUniquieCalls);
router.get('/getAgentTotalUniquieCalls', cdrs.getAgentTotalUniquieCalls);
router.get('/getTotalUniqueAnsweredCalls/:sdate/:edate', cdrs.getTotalUniqueAnsweredCalls);
router.get('/getTotalUniqueAnsweredCalls', cdrs.getTotalUniqueAnsweredCalls);
router.get('/getAgentTotalUniqueAnsweredCalls/:sdate/:edate', cdrs.getAgentTotalUniqueAnsweredCalls);
router.get('/getAgentTotalUniqueAnsweredCalls', cdrs.getAgentTotalUniqueAnsweredCalls);
router.get('/getAHT', cdrs.getAHT);
router.get('/getAgentAHT', cdrs.getAHT);
router.get('/cdr/weeklyReport', auth.required, cdrs.weeklyReport);
router.get('/cdr/hourlyReport', auth.required, cdrs.hourlyReport);
router.get('/getOxygens', cdrs.getOxygens);
router.get('/cdr/updateStatus/:id', cdrs.updateStatus);
router.post('/customerReport',cdrs.getCustomerReport);
router.get('/usageReport',cdrs.getUsageReport);
router.get('/buyerReport',cdrs.getBuyerReport);
router.get('/cdr/buyerDashboard', cdrs.buyerDashboard);
router.post('/cdr/addConcern', auth.required, cdrs.addConcern);
router.get('/cdr/fixing', cdrs.fixCDR);
router.get('/cdr/check', cdrs.jap);
router.post('/cdr/blacklist', cdrs.blacklist);
router.get('/cdr/getblacklist',cdrs.getBlacklist);
router.post('/cdr/delblacklist',cdrs.delBlacklist);
router.get('/cdr/fix2', cdrs.fix2);
router.get('/cdr/maxTfnCall', auth.required, cdrs.maxTfnCall);

module.exports = router;
