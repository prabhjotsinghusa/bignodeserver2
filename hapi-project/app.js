const Hapi = require('hapi');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');

const tfnRoutes = require('./routes/tfn.routes');
const realtimeRoutes = require('./routes/realtime.routes');
const waitingRoutes = require('./routes/waiting.routes');
const buyernumberRoutes = require('./routes/buyer_number.routes');
const cdrRoutes = require('./routes/cdr.routes');

const server = new Hapi.server({
    host: '0.0.0.0',
    port: 3001,
    routes: {
        cors: true
    },
});

mongoose.connect('mongodb://nodeuser:nodeuser@localhost/asteriskcdrdb?authSource=admin', { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.set('debug', true);

mongoose.connection.on('connected', () => {
    console.log('Mongo db is connected!');
});
mongoose.connection.on('error', (err) => {
    console.log('Mongo db is not connected!', err);
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello, world!';
    }
});
server.route(tfnRoutes);
server.route(realtimeRoutes);
server.route(waitingRoutes);
server.route(buyernumberRoutes);
server.route(cdrRoutes);

const tls = {
    key: fs.readFileSync('/var/www/ssl/private.key', 'utf8'),
    cert: fs.readFileSync('/var/www/ssl/certificate.crt', 'utf8')
}
const servers = new Hapi.server({
    host: '0.0.0.0',
    port: 8444,
    routes: {
        cors: true
    },
    tls:tls
});
servers.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello, world!';
    }
});
servers.route(tfnRoutes);
servers.route(realtimeRoutes);
servers.route(waitingRoutes);
servers.route(cdrRoutes);

const init = async () => {

    await server.start();
    await servers.start();
    console.log(`Server running at: ${server.info.uri}`);
    console.log(`Servers https running at: ${servers.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
