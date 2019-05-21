
var router = require('express').Router();
var auth = require('../auth');
const tfndetails = require('../../controllers/tfndetails');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');

router.get('/tfndetails/getTfn/', tfndetails.getDetails);
router.get('/tfndetails/getOne/', tfndetails.getOne);
module.exports = router;