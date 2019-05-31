const BotController = require('../controllers/bot.controller');
module.exports = [
    {
        path: '/bot/on_member_api',
        method:'GET',
        handler: BotController.onMemberApi
    }
];