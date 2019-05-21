
const router = require('express').Router();
const wallet_monthly = require('../../controllers/wallet_monthly');


router.get('/monthly/publishers', wallet_monthly.getPublishers);
router.get('/monthly/setPublishers', wallet_monthly.setPublishers);
router.delete('/monthly/deletePublishers', wallet_monthly.deletePublishers);

module.exports = router;