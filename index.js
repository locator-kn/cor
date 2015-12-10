'use strict';

const Hapi = require('hapi');
const Bluebird = require('bluebird');

// plugins
const Chairo = require('chairo');

// Create a server with a host and port
const server = new Hapi.Server();


// API
const user = require('./lib/user');

server.connection({
    host: 'localhost',
    port: 8000
});

// Add the route
server.route(user.routes);


// register plugins

server.register({register: Chairo}, err => {

    server.seneca
        // set desired transport method
        .use('rabbitmq-transport')
        // announce a microservice with pin and transport type the services is listening to
        .client({type: 'rabbitmq', pin: 'role:mailer,cmd:*'});

    let pact = Bluebird.promisify(server.seneca.act, {context: server.seneca});
    server.decorate('server', 'pact', pact);

});


// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
