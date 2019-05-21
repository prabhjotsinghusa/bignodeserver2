
const router = require('express').Router();
const wallet = require('../../controllers/wallet');

const {
  encodeMD5,
  getNextSequenceValue,
  createJWT,
  decodeJWT,
  fetchFile,
  schedulePayment,
  generateRandomString
} = require('../../Utilities/Utilities');

router.get('/PublisherBalance', wallet.getPublisherBalance);
router.get('/getPublisherBalanceTotal', wallet.getPublisherBalanceTotal);
router.get('/specificPubBal', wallet.getSpecificPubBal);
router.get('/BuyerBalance/:sDate/:eDate/:buyer_id', wallet.getBuyerBalance);
router.get('/BuyerBalance', wallet.getBuyerBalance);
router.post('/wallet/addPublisherBalance', wallet.addPublishserBalance);
router.post('/wallet/deductPublisherBalance', wallet.deductPublishserBalance);
router.get('/wallet/getDeduction', wallet.getDeduction);
router.get('/wallet/getPaidTransaction', wallet.getPaidTransaction);
router.delete('/wallet/deleteTransaction/:id', wallet.deleteTransaction);
router.delete('/wallet/deleteDeduction/:id', wallet.deleteDeduction);
router.get('/wallet/publisherBalance2', wallet.getPublisherBalance2);
router.get('/wallet/specificPubBal2', wallet.getSpecificPubBal2);

module.exports = router;
