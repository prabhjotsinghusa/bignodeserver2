const WaitingController = require('../controllers/waiting.controller');
module.exports = [
    {
        path: '/waiting/getAll',
        method:'GET',
        handler: WaitingController.getAll
    }

];