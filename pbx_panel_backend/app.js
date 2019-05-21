var http = require('http'),
  https = require('https'),
  fs = require('fs'),
  path = require('path'),
  methods = require('methods'),
  express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cors = require('cors'),
  passport = require('passport'),
  errorhandler = require('errorhandler'),
  mongoose = require('mongoose'),

  mysql = require('mysql');
  moment=require('moment');
  const busboy = require('connect-busboy');

  const mongodb = require('./config/mongodb'); 

var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();


app.use(cors());

// Normal express config defaults

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(busboy()); 

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  // mongoose.connect('mongodb://54.173.35.192/asteriskcdrdb',{ useNewUrlParser: true});
  mongoose.connect(mongodb.url, { useNewUrlParser: true }); 
}

mongoose.set('useCreateIndex', true);
mongoose.set('debug', true);

require('./models/User');
require('./models/AssignedPublishers');
require('./models/UserSettings');
require('./models/Buyer');
require('./models/Article');
require('./models/Comment');
require('./models/Tfn');
require('./models/ActiveHours');
require('./models/BuyerNumbers');
require('./models/Campaign');
require('./models/CampPubTfn');
require('./models/CampBuyerTfn');
require('./models/Cdr');
require('./models/BuyerFinances');
require('./models/PublisherFinances');
require('./models/AgentTimes');
require('./models/ManageGroup');
require('./models/PaymentNotification');
require('./models/AdminTransaction');
require('./models/Deduction');
require('./models/Realtime');
require('./models/Realtimestatus');
require('./models/FinanceHours');
require('./models/Cappings');
require('./models/PublisherKeys');
require('./models/Audio');
require('./models/Server');


require('./config/passport');

app.use(require('./routes/api/users'));
app.use(require('./routes/api/buyers'));
app.use(require('./routes/api/tfns'));
app.use(require('./routes/api/activehours'));
app.use(require('./routes/api/buyernumbers'));
app.use(require('./routes/api/campaigns'));
app.use(require('./routes/api/cdrs'));
app.use(require('./routes/api/eods'));
app.use(require('./routes/api/wallet'));
app.use(require('./routes/api/managegroups'));
app.use(require('./routes/api/paymentnotification'));
app.use(require('./routes/api/tfndetails'));
app.use(require('./routes/api/realtime'));
app.use(require('./routes/api/financehours'));
app.use(require('./routes/api/waitingcalls'));
app.use(require('./routes/api/cappings'));
app.use(require('./routes/api/audio'));
app.use(require('./routes/api/wallet_monthly'));

app.use(require('./routes/api/server'));
// /// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      'errors': {
        message: err.message,
        error: err
      }
    });
  });
}
/* for setting timezone in the node server CST */
process.env.TZ='America/Chicago';

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    'errors': {
      message: err.message,
      error: {}
    }
  });
});



var privateKey  = fs.readFileSync('/var/www/ssl/private.key', 'utf8');
var certificate = fs.readFileSync('/var/www/ssl/certificate.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

// finally, let's start our server...
var server = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port);
});
var servers = httpsServer.listen(8443, function () {
  console.log('Listening https on port ' + servers.address().port);
});
