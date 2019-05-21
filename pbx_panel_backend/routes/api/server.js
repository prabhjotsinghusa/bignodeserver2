
var router = require('express').Router();
var auth = require('../auth');
const server = require('../../controllers/server');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.post('/server/addServer/', server.addServer);
router.post('/server/updateServer/', server.updateServer);
router.get('/server/getServer/', server.getServer);
router.delete('/server/deleteServer/',server.deleteServer);
router.get('/server/activeServer/', server.getActiveServer);
module.exports = router;