var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var Buyer = mongoose.model('Buyer');
const buyers = require('../../controllers/buyers');
//const { generateRandomString } = require('../../Utilities/Utilities');
var auth = require('../auth');
const {
    encodeMD5,
    getNextSequenceValue,
    createJWT,
    decodeJWT,
    fetchFile,
    schedulePayment
} = require('../../Utilities/Utilities');

router.get('/buyer/getBuyer',auth.required, buyers.getBuyers);

router.get('/buyer/getDashboardBuyers',auth.required, buyers.getDashboardBuyers);

router.get('/buyer/getBuyerByPubId/:pub_id',auth.required, buyers.getBuyers);

router.get('/buyer/getBuyer/:buyerid',auth.required, buyers.getBuyer);

router.post('/buyer',auth.required,buyers.addBuyer);

router.post('/buyer/editBuyer/:buyerid',auth.required,buyers.editBuyer);

router.delete('/buyer/deleteBuyer/:buyerid',auth.required,buyers.deleteBuyer);

router.put('/buyer/updatePassword/:buyerid',auth.required, buyers.updatePassword);

router.get('/buyer/get', buyers.getDirect);

router.get('/buyer/get2', buyers.getDirect2);

router.get('/buyer/getBuyerDetailById/:id', buyers.getBuyerDetailById);

router.post('/buyer/getBuyerDetailByEmail', buyers.getBuyerDetailByEmail);

router.post('/buyer/getBuyerNumbers', buyers.getBuyerNumbers);

module.exports = router;
