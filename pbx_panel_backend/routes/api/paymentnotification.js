
var router = require('express').Router();
var auth = require('../auth');
const paymentnotification = require('../../controllers/paymentnotification');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');

router.get('/payment_notification/getAll', auth.required, paymentnotification.getAll);
router.get('/payment_notification/getCount', auth.required, paymentnotification.getCount);
router.get('/payment_notification/add', auth.required, paymentnotification.add);

module.exports = router;
