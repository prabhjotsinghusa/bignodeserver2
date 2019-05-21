
const router = require('express').Router();
const auth = require('../auth');
const audio = require('../../controllers/audio');



router.post('/audio/uploadAudio', auth.required, audio.uploadAudio);
router.get('/audio/fetchAudio', auth.required, audio.fetchAudioFile);

module.exports = router;
