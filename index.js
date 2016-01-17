'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

const Bluebird = require('bluebird');
const Glue = require('glue');

const util = require('./lib/util');

// API
const user = require('./lib/user');
const location = require('./lib/location');
const file = require('./lib/file');
const messenger = require('./lib/messenger');
const reporter = require('./lib/reporter');


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
    }, {
        'h2o2': {}
    }, {
        'good': [{
            options: {
                requestPayload: true,
                reporters: [{
                    reporter: require('good-console'),
                    events: {log: '*', response: '*', request: '*'}
                }]
            }
        }]
    }, {
        'tv': {}
    }]
};

// compose Server with plugins
Glue.compose(manifest, {relativeTo: __dirname}, (err, server) => {

    if (err) {
        throw err;
    }

    // configure auth strategy
    server.auth.strategy('session', 'cookie', 'optional', {
        password: process.env['COOKIE_SECRET'],
        ttl: 3600000,
        keepAlive: true,
        cookie: 'locator_session',
        isSecure: false, //TODO
        clearInvalid: true
    });

    server.ext('onPostAuth', (request, reply) => {
        request.basicSenecaPattern = {
            requesting_user_id: util.getUserId(request.auth),
            cmd: ''
        };
        reply.continue();
    });

    // Add the API routes
    server.route(user.routes);
    server.route(location.routes);
    server.route(file.routes);
    server.route(messenger.routes);
    server.route(reporter.routes);

    server.route({
        method: 'GET',
        path: '/my/bubblescreen',
        handler: (request, reply) => {

            // temp hack begin
            let userId = request.basicSenecaPattern.requesting_user_id !== 'unknown' ? request.basicSenecaPattern.requesting_user_id : '56786fe3522786413366397a';
            // temp hack end

            let senecaActMessages = {
                role: 'messenger',
                cmd: 'latestmessages',
                distict: 'conversation',
                data: {
                    'user_id': userId,
                    'query': {
                        count: 3
                    }
                }
            };

            let senecaActRecommendations = {
                role: 'reporter',
                cmd: 'recommendationForPerson',
                data: {
                    namespace: 'locations',
                    user_id: userId,
                    actions: {
                        views: 1,
                        likes: 1,
                        addimpression: 1
                    }
                }
            };

            let senecaActLocations = {
                cmd: 'nearby',
                data: {
                    long: 9.173626899719238,
                    lat: 47.66972243634168,
                    maxDistance: 2,
                    limit: 3
                },
                role: 'location'
            };

            let messages = request.server.pact(senecaActMessages);
            let locations = request.server.pact(senecaActLocations);
            let recommendations = request.server.pact(senecaActRecommendations);

            Promise.all([messages, locations, recommendations])
                .then(results => {
                    console.log('recommendations:', results[2]);
                    return {
                        messages: results[0],
                        locations: results[1].results
                    };
                })
                .then(reply)
                .catch(reply);
        },
        config: {
            description: 'Get data for bubblescreen',
            notes: 'returns object with two arrays: messages and locations',
            tags: ['api', 'bubblescreen', 'messages', 'locations'],
            auth: {
                mode: 'optional',
                strategy: 'session'
            }
        }
    });

    // configure seneca
    server.seneca
        // set desired transport method
        //.use(process.env['SENECA_TRANSPORT_METHOD'] + '-transport')
        // announce a microservice with pin and transport type the service is listening to
        .client({type: 'tcp', port: 7003, host: 'localhost', pin: 'role:messenger,cmd:*'})
        .client({type: 'tcp', port: 7002, host: 'localhost', pin: 'role:user,cmd:*'})
        .client({type: 'tcp', port: 7001, host: 'localhost', pin: 'role:location,cmd:*'})
        .client({type: 'tcp', port: 7010, host: 'localhost', pin: 'role:reporter,cmd:*'});

    // promisify seneca.act
    let pact = Bluebird.promisify(server.seneca.act, {context: server.seneca});
    // decorate server object with promisified seneca.act
    server.decorate('server', 'pact', pact);


    // start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });


});
