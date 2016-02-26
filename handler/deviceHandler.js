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

    let senecaAct = util.setupSenecaPattern(pattern, request.payload, basicPin);

    // call microservice with pattern
    request.server.pact(senecaAct)
        .then(helper.unwrap)
        .then(result => {

            if (!result.isBoom) {

                return reply({message: 'device registered, locator-cookie was set'})
                    .state('locator', {device_id: result.deviceId}).code(201);
            }

            return reply(result);
        })
        .catch(error => reply(boom.badImplementation(error)));

};

module.exports = handler;
