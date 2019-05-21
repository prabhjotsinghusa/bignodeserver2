
var router = require('express').Router();
var auth = require('../auth');
const cappings = require('../../controllers/ccappings');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.post('/cappings/add',  auth.required, cappings.add);
router.get('/cappings/getAll', auth.required,  cappings.getAll);
router.get('/cappings/getAllCappings', cappings.getAll);
router.get('/cappings/getAll/:id',  auth.required, cappings.getAll);
router.get('/cappings/get/',cappings.get);
router.put('/cappings/update/:id',  auth.required,  cappings.update);
router.delete('/cappings/delete/:id', cappings.deleteRow);
router.get('/cappings/check/',cappings.check);
router.post('/cappings/changeStatus/',cappings.changeStatus);
router.post('/cappings/changePause/',cappings.changePause);
router.post('/cappings/changePriority/',cappings.changePriority);
router.get('/cappings/realtime/',cappings.realtime);
router.get('/cappings', cappings.getAll2);
router.get('/cappings/update', cappings.updateDirect);
router.get('/cappings/buyerCapping', cappings.getBuyerCapping);
router.delete('/cappings/deleteCapping/:id', cappings.deleteCapping);
router.post('/cappings/removeMember/', cappings.removeMember);
module.exports = router;
