'use strict';
const boom = require('boom');

const util = require('../lib/util');
const helper = require('../lib/responseHelper');

let handler = {};
const basicPin = {
    role: 'user'
};

handler.register = (request, reply) => {

    // setup pattern
    let pattern = util.clone(request.basicSenecaPattern);

    pattern.cmd = 'register';
    pattern.entity = 'device';

    let device = request.payload;
    let isAuthenticated = request.auth.isAuthenticated;

    if (isAuthenticated) {
        device.user_id = request.basicSenecaPattern.requesting_user_id;
    }

    let senecaAct = util.setupSenecaPattern(pattern, device, basicPin);

    // call microservice with pattern
    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(result => {

            if (!result.isBoom) {

                if (isAuthenticated) {

                    // set new device id to existing auth cookie
                    let cookie = request.auth.credentials;
                    cookie.device_id = result.device_id;

                    request.auth.session.set(cookie);
                    return reply({message: 'device registered, locator-cookie was set'}).code(201);
                }

                return reply({message: 'device registered, locator-cookie was set'})
                    .state('locator', {device_id: result.deviceId}).code(201);
            }

            return reply(result);
        })
        .catch(error => reply(boom.badImplementation(error)));

};

module.exports = handler;
