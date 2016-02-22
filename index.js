'use strict';

const path = require('path');
const pwd = path.join(__dirname, '..', '/.env');
require('dotenv').config({path: pwd});

// init opbeat, secret and orga will be loaded from env
require('opbeat').start({
    appId: 'da7c1e68f2',
    active: process.env['NODE_ENV'] === 'production'
});

const Bluebird = require('bluebird');
const Glue = require('glue');

const util = require('./lib/util');

const log = require('ms-utilities').logger;

// API
const user = require('./lib/user');
const location = require('./lib/location');
const file = require('./lib/file');
const messenger = require('./lib/messenger');
const reporter = require('./lib/reporter');
const device = require('./lib/device');

// TEMP
const locationValidation = require('./validation/locationValidation');


// declare  plugins
var manifest = {
    connections: [{
        //host: process.env['API_HOST'] || 'localhost',
        port: process.env['API_PORT'] || 8000
    }],
    plugins: [{
        // plugin for the microservice framework seneca
        'chairo': {}
    }, {
        // server side rendering
        'inert': {}
    }, {
        // server side rendering
        'vision': {}
    }, {
        // documentation of API
        'hapi-swagger': {}
    }, {
        // cookie plugin for authentication
        'hapi-auth-cookie': {}
    }, {
        // proxy plugin
        'h2o2': {}
    }, {
        // Logger plugin
        'good': [{
            options: {
                requestPayload: true,
                reporters: [{
                    reporter: require('good-console'),
                    events: {log: '*', response: '*', request: '*'}
                }, {
                    reporter: require('good-bunyan'),
                    config: {
                        logger: require('bunyan')
                            .createLogger({
                                name: 'locator',
                                streams: [{
                                    type: 'rotating-file',
                                    path: '/var/log/locator/cor/cor.log',
                                    period: '1d',   // daily rotation
                                    count: 14        // keep 14 back copies
                                }]
                            })
                            .child({service: 'cor'}),
                        levels: {
                            log: 'info',
                            response: 'info',
                            request: 'info'
                        }
                    },
                    events: {log: '*', response: '*', request: '*'}
                }]
            }
        }]
    }, {
        // interactive debug console
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


    // configure device cookie
    server.state('locator', {
        ttl: 24 * 60 * 60 * 1000,     // One day
        isSecure: false,
        path: '/',
        encoding: 'base64json'
    });

    // decorate request object with user id and device id
    server.ext('onPostAuth', (request, reply) => {
        request.basicSenecaPattern = {
            requesting_user_id: util.getUserId(request.auth),
            requesting_device_id: util.getDeviceId(request.state),
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
    server.route(device.routes);

    // TEMP/DEV ROUTES
    server.route({
        method: 'GET',
        path: '/my/bubblescreen',
        handler: (request, reply) => {

            // temp hack begin
            let userId = request.basicSenecaPattern.requesting_user_id !== 'unknown' ? request.basicSenecaPattern.requesting_user_id : '569e4a83a6e5bb503b838308';
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
                    long: request.query.long || 9.173626899719238,
                    lat: request.query.lat || 47.66972243634168,
                    maxDistance: request.query.maxDistance || 2,
                    limit: request.query.limit || 3
                },
                role: 'location'
            };

            console.time('retrieving messages, locations and recommendations(ids)');
            let messages = request.server.pact(senecaActMessages);
            let locations = request.server.pact(senecaActLocations);
            let recommendations = request.server.pact(senecaActRecommendations);

            Promise.all([messages, locations, recommendations])
                .then(results => {
                    console.timeEnd('retrieving messages, locations and recommendations(ids)');
                    let promises = [];
                    console.time('retrieving recommendations');
                    for (let i = 0; i < 3; i++) {
                        if (results[2].recommendations[i]) {
                            let senecaActLocationById = {
                                cmd: 'locationById',
                                role: 'location',
                                requesting_user_id: userId,
                                data: {
                                    locationId: results[2].recommendations[i].thing
                                }
                            };
                            promises.push(request.server.pact(senecaActLocationById));

                            console.log('[', userId, ']: recommended location_id', results[2].recommendations[i].thing);
                        }
                    }
                    return Promise.all(promises).then(res => {

                        console.timeEnd('retrieving recommendations');
                        return {
                            messages: results[0].data,
                            locations: results[1].data.results,
                            recommendations: res
                        };
                    });


                })
                .then(data => reply(data).ttl(30000))
                .catch(reply);
        },
        config: {
            description: 'Get data for bubblescreen',
            notes: 'returns object with two arrays: messages and locations',
            tags: ['api', 'bubblescreen', 'messages', 'locations'],
            auth: {
                mode: 'optional',
                strategy: 'session'
            },
            validate: {
                query: locationValidation.nearbyQueryOptional
            }
        }
    });


    server.route({
        method: 'POST',
        path: '/dev/login',
        handler: (request, reply) => {
            request.auth.session.set({
                _id: '569e4a83a6e5bb503b838309',
                mail: 'SteffenGorenflo@gmail.com'
            });
            reply('authenticated');
        },
        config: {
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            tags: ['api']
        }
    });

    server.route({
        method: 'GET',
        path: '/dev/logout',
        handler: (request, reply) => {
            request.auth.session.clear();
            reply('bye bye');
        },
        config: {
            tags: ['api']
        }
    });

    server.route({
        method: 'POST',
        path: '/dev/test',
        handler: (request, reply) => {
            reply({payload: request.payload, headers: request.headers});
        },
        config: {
            tags: ['api']
        }
    });

    server.route({
        method: 'POST',
        path: '/dev/test/formData',
        handler: (request, reply) => {
            if (request.payload.file) {
                delete request.payload.file._data;
            }
            reply({payload: request.payload, headers: request.headers});
        },
        config: {
            tags: ['api'],
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 1048576 * 6 // 6MB
            }
        }
    });


    server.ext('onPreResponse', (request, reply) => {
        const response = request.response;
        if (!response.isBoom) {
            return reply.continue();
        }

        if (response.data && response.data.isJoi) {
            log.fatal('Validation error', {response: response, requestData: request.orig, path: request.path});
        }


        reply.continue();
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
    server.start(err => {

        if (err) {
            throw err;
        }
        log.info('Server running at:', server.info.uri);
    });


});
