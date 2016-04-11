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

// Locator API
const user = require('./lib/user');
const location = require('./lib/location');
const device = require('./lib/device');
const develop = require('./lib/development');


// declare  plugins
let manifest = {
    connections: [{
        //host: process.env['API_HOST'] || 'localhost',
        port: process.env['API_PORT'] || 8000
    }],
    registrations: [
        {plugin: 'inert'}, // server side rendering (for swagger)
        {plugin: 'vision'}, // server side rendering (for swagger)
        {plugin: 'hapi-swagger'}, // documentation of API
        {plugin: 'chairo'},// plugin for the microservice framework seneca
        {plugin: 'hapi-auth-cookie'}, // cookie plugin for authentication
        {plugin: 'h2o2'}, // proxy plugin (used for ms-fileserve)
        {
            plugin: {
                register: 'good',
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
            }
        }

    ]
};
// compose Server with plugins
Glue.compose(manifest, {relativeTo: __dirname})
    .then(server => {

        // Add the API routes
        server.route(user.routes);
        server.route(location.routes);
        server.route(device.routes);

        // Add develop/test routes only if not in production
        if (process.env['NODE_ENV'] !== 'production') {
            server.route(develop.routes);
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
            // TODO: set password and inspect API
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

        // logging 
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
        server.seneca.use('mesh', {auto: true, pin: {role: 'cor'}});

        // promisify seneca.act
        let pact = Bluebird.promisify(server.seneca.act, {context: server.seneca});
        // decorate server object with promisified seneca.act
        server.decorate('server', 'pact', pact);

        // start the server
        return server.start(err => {

            if (err) {
                throw err;
            }
            log.info('Server running at:', server.info.uri)
        });
    })
    .catch(err => {
        log.fatal({err: err});
        throw err;
    });
