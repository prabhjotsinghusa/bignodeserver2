const BuyernumberController = require('../controllers/buyernumber.controller');
module.exports = [
    {
        path: '/getBuyerNumber',
        method:'GET',
        handler: BuyernumberController.find
    },
    {
        path: '/buyernumber/get',
        method:'GET',
        handler: BuyernumberController.get
    },

];