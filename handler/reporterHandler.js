'use strict';
const boom = require('boom');

const util = require('../lib/util');


let handler = {};
const basicPin = {
    role: 'reporter'
};


handler.getRecByUserId = (request, reply) => {
    let userId = request.params.userId;
    let senecaAct = util.setupSenecaPattern({
        cmd: 'recommendationForPerson'
    }, {
        user_id: userId,
        namespace: 'locations',
        actions: {
            view: 1,
            likes: 2
        }

    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            if (error.cause.name === 'not found') {
                return reply(boom.notFound(error.details.message));
            }
            console.log(JSON.stringify(error));
            return reply(boom.badRequest(error.details.message));

        });
};


module.exports = handler;