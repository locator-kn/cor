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
//const ipUtil = require('ms-utilities').ip;

// API
const user = require('./lib/user');
const location = require('./lib/location');
//const messenger = require('./lib/messenger');
//const reporter = require('./lib/reporter');
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
                                    path: process.env['PATH_LOGFILE_COR'] + 'cor.log',
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
        ttl: 24 * 60 * 60 * 1000 * 365,   // 1 year
        keepAlive: true,
        cookie: 'locator_session',
        isSecure: false, //TODO
        clearInvalid: true
    });


    // configure device cookie
    server.state('locator', {
        ttl: 24 * 60 * 60 * 1000 * 365,   // 1 year
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
    //server.route(messenger.routes);
    //server.route(reporter.routes);
    server.route(device.routes);

    // TEMP/DEV ROUTES
    server.route({
        method: 'GET',
        path: '/my/bubblescreen',
        handler: (request, reply) => {
            /*
             ipUtil.get(request.info.address, (err, res) => {
             if(err) {
             return console.error(err);
             }
             console.log('test:', res);
             });
             */
            let senecaActLocations = {
                cmd: 'nearby',
                data: {
                    long: request.query.long || 9.173626899719238,
                    lat: request.query.lat || 47.66972243634168,
                    maxDistance: request.query.maxDistance || 30000,
                    limit: request.query.limit || 6
                },
                role: 'location'
            };

            request.server.pact(senecaActLocations)
                .then(results => {
                    return {
                        locations: results.data
                    };
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
    
    if(process.env['NODE_ENV'] !== 'production') {
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
    }

    server.on('request-error', (request, err) => {

        // log 500 code
        log.fatal('Server Error', {
            error: err,
            requestData: request.orig,
            path: request.path
        });

    });


    // log errors before response is sent back to user
    server.ext('onPreResponse', (request, reply) => {
        const response = request.response;
        if (!response.isBoom) {
            return reply.continue();
        }

        // log joi validation error
        if (response.output.statusCode === 400) {

            log.fatal('Client error', {
                response: response,
                requestData: request.orig,
                path: request.path
            });
        }

        reply.continue();
    });


    // configure seneca
    server.seneca
        // set desired transport method
        //.use(process.env['SENECA_TRANSPORT_METHOD'] + '-transport')
        // announce a microservice with pin and transport type the service is listening to
        //.client({type: 'tcp', port: 7003, host: 'localhost', pin: 'role:messenger,cmd:*'})
        .client({type: 'tcp', port: 7005, host: 'localhost', pin: 'role:mailer,cmd:*'})
        .client({type: 'tcp', port: 7004, host: 'localhost', pin: 'role:notifications,cmd:*'})
        .client({type: 'tcp', port: 7002, host: 'localhost', pin: 'role:user,cmd:*'})
        .client({type: 'tcp', port: 7001, host: 'localhost', pin: 'role:location,cmd:*'});
        //.client({type: 'tcp', port: 7010, host: 'localhost', pin: 'role:reporter,cmd:*'});

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
