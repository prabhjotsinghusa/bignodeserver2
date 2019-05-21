
var router = require('express').Router();
var auth = require('../auth');
const activehours = require('../../controllers/activehours');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.post('/ActiveHours/add', auth.required, activehours.addActiveHour);

router.get('/ActiveHours/getAll', auth.required, activehours.getActiveHour);

router.get('/ActiveHours/getActiveHour/:id', auth.required, activehours.getActiveHour);

router.put('/ActiveHours/update/:id', auth.required, activehours.updateActiveHour);

router.delete('/ActiveHours/delete/:id',auth.required,activehours.deleteActiveHour);

module.exports = router;
