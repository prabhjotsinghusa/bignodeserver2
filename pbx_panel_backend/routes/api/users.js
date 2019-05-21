
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');
const users = require('../../controllers/users');

const {
  encodeMD5,
  getNextSequenceValue,
  createJWT,
  decodeJWT,
  fetchFile,
  schedulePayment,
  generateRandomString
} = require('../../Utilities/Utilities');

router.post('/users/login', function (req, res, next) {

  var output = { success: 'NOK' };

  if (req.body.username == '') {
    output = { errors: "User can't be blank" };
    return res.status(422).json(output);
  }

  if (req.body.password == '') {
    output = { errors: "Password can't be blank" };
    return res.status(500).json(output);

  }
  passport.authenticate('local', { session: false }, function (err, user, info) {

    console.log(err, user, info, "users");

    if (err) { return next(err); }

    if (user) {
      output = { success: 'OK', user: user, login_token: user.generateJWT() };
      return res.json(output);
    } else {

      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.put('/users/logout', auth.required, function (req, res, next) {




});

router.get('/publisher/getPublishers', auth.required, users.getPublishers);

router.get('/publisher/getDashboardPublishers', auth.required, users.getDashboardPublishers);

router.get('/auditers', auth.required, users.getAuditers);

router.get('/publisher/getActivePublishers', auth.required, users.getActivePublishers);

router.post('/publisher', auth.required, users.addPublisher);

router.post('/publisher/:uid', auth.required, users.editPublisher);

router.post('/publisher/settings/:uid', auth.required, users.editPublisherSettings);

router.get('/publisher/getPublisherSettings/:uid', users.getPublishersSettings);

router.get('/publisher/getPublishers/:uid', auth.required, users.getPublisher);

router.put('/publisher/deletePublisher/:uid', auth.required, users.deletePublisher);

router.delete('/deleteAuditer/:uid', auth.required, users.deleteAuditer);

router.put('/user/updateProfile/:uid', auth.required, users.updateProfile);

router.get('/publisher/getAssignedPublisher/:audit_profile_id', users.getAssignedPublishers);

router.post('/assignPublisher', users.addAssignedPublisher);

router.put('/user/updatePassword/:uid', users.updatePassword);

router.get('/user/email/:uid',users.sendemail);

router.get('/user/get', users.getDirect);

router.get('/user/getTime', users.getTime);

router.post('/user/addPublisherKey', users.addPublisherKey);

router.get('/user/getTfnFromPublisherKey', users.getTfnFromPublisherKey);

router.get('/publisher/getPublisherName/:uid',  users.getPublisherName);

router.get('/publisher/getCallsByEmail', users.getCallsByEmail);

router.post('/user/getUserDetails', users.getUserDetailsById);

router.post('/user/getUserDetailsById/:id', users.getUserDetailsById);

router.get('/publisher/getCallsByTfn', users.getCallsByTfn);
module.exports = router;
