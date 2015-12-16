'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

const Bluebird = require('bluebird');
const Glue = require('glue');

// API
const user = require('./lib/user');
const location = require('./lib/location');
const file = require('./lib/file');


// declare  plugins
var manifest = {
    connections: [{
        //host: process.env['API_HOST'] || 'localhost',
        port: process.env['API_PORT'] || 8000
    }],
    plugins: [{
        'chairo': {}
    }, {
        'inert': {}
    }, {
        'vision': {}
    }, {
        'hapi-swagger': {}
    }, {
        'hapi-auth-cookie': {}
    }]
};

// compose Server with plugins
Glue.compose(manifest, {relativeTo: __dirname}, (err, server) => {

    if (err) {
        throw err;
    }

    // configure seneca
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


    // configure auth strategy
    server.auth.strategy('session', 'cookie', {
        password: 'secret',
        ttl: this.ttl || 600000,
        keepAlive: true,
        cookie: 'locator_session',
        isSecure: false,
        clearInvalid: true
    });

    // Add the API routes
    server.route(user.routes);
    server.route(location.routes);
    server.route(file.routes);


    // start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });


});
