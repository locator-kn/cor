'use strict';
const boom = require('boom');

const util = require('../lib/util');


let handler = {};
const basicPin = {
    role: 'location'
};

handler.getLocationById = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('locationById', request.params, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};

handler.getLocationsNearby = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('nearby', request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};

handler.postNewLocation = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('addnewlocation', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};


handler.postSchoenhier = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('addschoenhier', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });

};


handler.getSchoenhierNearby = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('nearbyschoenhier', request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
};


handler.getLocationsStream = (request, reply) => {

    //return reply(boom.notImplemented('still todo'));
    return reply([{
        user: '5677fdec53f5beead532b1e3',
        date: '2015-07-27T07:24:06.381Z',
        type: 'audio',
        path: '/audio/pipapoid/file.mp3'
    }, {
        user: '5677fdec53f5beead532b1e3',
        date: '2015-07-26T07:24:06.381Z',
        type: 'video',
        path: '/video/pipapoid2/file.mpg'
    }, {
        user: '5677fdec53f5beead532b1e3',
        date: '2015-07-26T06:24:06.381Z',
        type: 'video',
        path: '/video/pipapoid3/file2.mpg'
    }]);
};

handler.getMyFavoriteLocations = (request, reply) => {

    return reply(boom.notImplemented('todo'));
};

handler.postToggleFavorLocation = (request, reply) => {

    let userId = util.getUserId(request.auth);
    let senecaAct = util.setupSenecaPattern('toggleFavor', {
        location_id: request.params.locationId,
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            console.log(error);
            if (error.cause.details.message && error.cause.details.message === 'Invalid id') {
                return reply(boom.notFound());
            }
            reply(boom.badImplementation(error));
        });
};

handler.getLocationByName = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('locationbyname', request.query, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            reply(boom.badRequest(error));
        });
};

handler.postUpdateLocation = (request, reply) => {
    return reply(boom.notImplemented ('todo'));
};


module.exports = handler;