
var router = require('express').Router();
var auth = require('../auth');
const tfns = require('../../controllers/tfns');

const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString
} = require('../../Utilities/Utilities');

router.get('/getAllTfns', auth.required, tfns.getAllTfns);

router.get('/tfn/getDashboardTfns', auth.required, tfns.getDashboardTfns);

router.get('/getPendingTfns', auth.required, tfns.getPendingTfns);

router.get('/getTfnByPublisher/:pub_id', auth.required, tfns.getTfn);

router.get('/getTfnByBuyer/:buyer_id', auth.required, tfns.getTfn);

router.get('/getTfnByTfn/:tfn', auth.required, tfns.getTfn);

router.get('/getTfnById/:id', auth.required, tfns.getTfn);

router.get('/getAvailableTfn', auth.required, tfns.getAvailableTfn);

router.put('/updatePublisher/:id', tfns.updatePublisher);

router.post('/addTfn', tfns.addTfn);

router.post('/checkTfn', tfns.checkTfn);

router.post('/buyTfn', tfns.buyTfn);

router.delete('/tfn/delete/:id', tfns.deleteTfn);

router.get('/getAvailableTfn', auth.required, tfns.getAvailableTfn);

router.get('/tfn/pri',tfns.prishi);

router.get('/tfn/tfnapi', tfns.tfnapi);
router.post('/tfn/add', tfns.addTfn2);

module.exports = router;
