
var router = require('express').Router();
var auth = require('../auth');
const userhistory = require('../../controllers/userhistory');


const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.get('/userhistory/find', auth.required, userhistory.find);
router.post('/userhistory/add', userhistory.add);
router.delete('/userhistory/delete', auth.required, userhistory.delete);
router.delete('/userhistory/deleteAll', auth.required, userhistory.deleteAll);

module.exports = router;