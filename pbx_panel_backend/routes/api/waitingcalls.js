const router = require('express').Router();
const auth = require('../auth');
const waitingcalls = require('../../controllers/waitingcalls');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.get('/waiting/getAll', waitingcalls.getAll);


module.exports = router;
