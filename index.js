'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

const Hapi = require('hapi');
const Bluebird = require('bluebird');

// plugins
const Chairo = require('chairo');

// Create a server with a host and port
const server = new Hapi.Server();


// API
const user = require('./lib/user');
const location = require('./lib/location');
const file = require('./lib/file');

server.connection({
    //host: process.env['API_HOST'] || 'localhost',
    port: process.env['API_PORT'] || 8000
});

// Add the routes
server.route(user.routes);
server.route(location.routes);
server.route(file.routes);


// register plugins

server.register({register: Chairo}, err => {

    if(err) {
        throw err;
    }

    server.seneca
        // set desired transport method
        .use(process.env['SENECA_TRANSPORT_METHOD'] + '-transport')
        // announce a microservice with pin and transport type the services is listening to
        .client({type: process.env['SENECA_TRANSPORT_METHOD'], pin: 'role:user,cmd:*'})
        .client({type: process.env['SENECA_TRANSPORT_METHOD'], pin: 'role:location,cmd:*'});

    // promisify seneca.act
    let pact = Bluebird.promisify(server.seneca.act, {context: server.seneca});
    // decorate server object with promisified seneca.act
    server.decorate('server', 'pact', pact);

});

server.register([require('inert'), require('vision'), {register: require('hapi-swagger'), options: {
        enableDocumentationPage: true
}}], err => {

    if (err) {
        throw err;
    }
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });

});



