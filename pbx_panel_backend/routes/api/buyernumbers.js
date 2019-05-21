
const router = require('express').Router();
const auth = require('../auth');
const buyerNumbers = require('../../controllers/buyerNumbers');
const {

    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment,
    generateRandomString

} = require('../../Utilities/Utilities');

router.post('/BuyerNumbers/add', auth.required, buyerNumbers.addBuyerNumber);

router.get('/BuyerNumbers/getBuyerNumber/:buyerId', auth.required, buyerNumbers.getAllBuyerNumbers);

router.put('/BuyerNumbers/updateStatus/:id', auth.required, buyerNumbers.updateBuyerNumber);

router.delete('/BuyerNumbers/delete/:id', auth.required, buyerNumbers.deleteBuyerNumber);

router.get('/BuyerNumbers/getBuyer', buyerNumbers.getBuyer);

router.get('/BuyerNumbers/getAll',  auth.required, buyerNumbers.getAll);

router.post('/BuyerNumbers/updateBuyerNumberSettings/:id',  auth.required, buyerNumbers.updateBuyerNumberSettings);

router.get('/BuyerNumbers/getBuyerNumberSettings/:id', buyerNumbers.getBuyerNumberSettings);

router.get('/BuyerNumbers/getBuyerDetails/:buyerNumber',buyerNumbers.getBuyerDetails);

module.exports = router;
