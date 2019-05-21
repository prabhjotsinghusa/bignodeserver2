
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
const realtimes = require('../../controllers/realtimes');

const secondrealtimes = require('../../controllers/secondrealtime');

/*const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT, 
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');
*/

router.get('/getRealtime', realtimes.getRealtime);
router.get('/realtime/getBuyer', realtimes.getBuyerRealtime);
router.get('/realtime/getCount', realtimes.getCount);
router.get('/realtime/publisher', realtimes.getPublisher);
router.get('/realtime/getRealtime', realtimes.getCalls);
router.get('/realtime/getSpecificBuyer', realtimes.getSpecificBuyer);
router.get('/realtime/getCapping', realtimes.getCapping);
router.get('/secondrealtime/getBuyer', secondrealtimes.getBuyer);
router.get('/secondrealtime/getSpecificBuyer', secondrealtimes.getSpecificBuyer);
router.get('/secondrealtime/getSpecificPub', secondrealtimes.getSpecificPub);

module.exports = router;
