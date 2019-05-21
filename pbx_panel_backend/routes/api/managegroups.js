const router = require('express').Router();
const auth = require('../auth');
const groups = require('../../controllers/managegroups');

const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.get('/group/getAll', groups.getAll);
router.get('/group/getAll/:gid', groups.getAll);
router.post('/group/addGroup', groups.addGroup);
router.put('/group/editGroup/:gid', groups.editGroup); 
router.delete('/group/deleteGroup/:gid', groups.deleteGroup); 

module.exports = router;
