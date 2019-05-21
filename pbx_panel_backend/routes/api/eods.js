
var router = require('express').Router();
const eods = require('../../controllers/eods');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT, 
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');


router.get('/getPubs', eods.getPublishers);
router.post('/getCopy', eods.getCopy);
router.get('/getGroups', eods.getGroups);
router.get('/getGroups/:gid', eods.getGroups);
router.get('/getAgents', eods.getAgents);
router.get('/getTotalAgents', eods.getTotalAgents);
router.get('/eod/getBuyers', eods.getBuyers);

router.get('/eod/getPubslisher', eods.getPublishers2);
module.exports = router;
