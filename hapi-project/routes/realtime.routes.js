const RealtimeController = require('../controllers/realtime.controller');
module.exports = [
    {
        path: '/realtime/getBuyer',
        method:'GET',
        handler: RealtimeController.getBuyer
    },
    {
        path: '/realtime/specificBuyer',
        method:'GET',
        handler: RealtimeController.getSpecific
    },
    {
        path: '/realtime/getBuyer2',
        method:'GET',
        handler: RealtimeController.getBuyer2
    },

];