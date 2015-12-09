'use strict';

const Hapi = require('hapi');

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

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});