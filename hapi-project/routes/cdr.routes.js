const CdrController = require('../controllers/cdr.controller');
module.exports = [
    {
        path: '/getTotalCalls',
        method: 'GET',
        handler: CdrController.getTotalCalls
    },
    {
        path: '/getAHT',
        method: 'GET',
        handler: CdrController.getAHT
    },
    {
        path: '/getTotalUniqueAnsweredCalls',
        method: 'GET',
        handler: CdrController.getTotalUniqueAnsweredCalls
    },
    {
        path: '/getTotalUniquieCalls',
        method: 'GET',
        handler: CdrController.getTotalUniquieCalls
    },
    {
        path: '/cdr/addConcern',
        method: 'POST',
        handler: CdrController.addConcern
    }
];