const TFNController = require('../controllers/tfn.controller');
module.exports = [
    {
        path: '/getTfndetails',
        method:'GET',
        handler: TFNController.find
    },

];