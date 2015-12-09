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

server.register({ register: Chairo }, err => {
    //console.log(server.seneca.act);
    //
    let act = Bluebird.promisify(server.seneca.act, server.seneca);
    //server.expose('pact', act);

    server.decorate('request', 'pact', act);
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});