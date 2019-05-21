
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
const financehours = require('../../controllers/financehours');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT, 
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');


router.get('/getFinanceHours', financehours.getFinanceHours);
router.get('/getFinanceHourById/:fid', financehours.getFinanceHourById);
router.post('/addFinanceHours', financehours.addFinanceHours);
router.post('/editFinanceHours/:fid', financehours.editFinanceHours);
router.delete('/deleteFinanceHours/:fid', financehours.deleteFinanceHour);

module.exports = router;
