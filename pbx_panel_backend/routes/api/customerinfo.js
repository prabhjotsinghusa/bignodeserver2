
var router = require('express').Router();
var auth = require('../auth');
const customerinfo = require('../../controllers/customerinfo');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.post('/customerinfo/add', customerinfo.addCustomerInfo);
module.exports = router;
