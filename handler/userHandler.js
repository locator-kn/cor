'use strict';
const hoek = require('hoek');
const boom = require('boom');

const util = require('../lib/util');

let handler = {};
const basicPin = {
    role: 'user'
};

handler.login = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('login', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(result => {

            request.auth.session.set({
                _id: result._id,
                mail: result.mail
            });
            reply(result);
        })
        .catch(error => {
            reply(boom.unauthorized());
        });

};


handler.logout = (request, reply) => {
    request.auth.session.clear();
    reply({
        message: 'You are logged out'
    });
};

handler.register = (request, reply) => {

    let senecaAct = util.setupSenecaPattern('register', request.payload, basicPin);

    request.server.pact(senecaAct)
        .then(result => {
            if (result.hasOwnProperty('exists')) {
                reply(boom.conflict('user with this mail already exists'));
            } else {
                request.auth.session.set(result);
                reply('user created').code(201);
            }

        })
        .catch(error => {
            console.log(error);
            reply(boom.badRequest());
        });
};

handler.follow = (request, reply) => {
    let userID = util.getUserId(request.auth);

    request.basicSenecaPattern.cmd = 'follow';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        to_follow: request.params.toFollow,
        user_id: userID
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            let errorMsg = error.cause.details.message ? error.cause.details.message : 'unknown';
            reply(boom.badRequest(errorMsg));
        });

};

let getFollowingUsersByUserId = (request, reply, userId) => {
    request.basicSenecaPattern.cmd = 'getfollowing';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        user_id: userId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            let errorMsg = error.cause.details.message ? error.cause.details.message : 'unknown';
            reply(boom.badRequest(errorMsg));
        });
};

handler.getMyFollowing = (request, reply) => {

    getFollowingUsersByUserId(request, reply, request.requestingUserId);

};

handler.getFollowingByUserId = (request, reply) => {

    getFollowingUsersByUserId(request, reply, request.params.userId);

};


let getFollowerByUserId = (request, reply, userId) => {

    request.basicSenecaPattern.cmd = 'getfollowers';

    let senecaAct = util.setupSenecaPattern(request.basicSenecaPattern, {
        user_id: userId || request.requestingUserId
    }, basicPin);

    request.server.pact(senecaAct)
        .then(reply)
        .catch(error => {
            let errorMsg = error.cause.details.message ? error.cause.details.message : 'unknown';
            reply(boom.badRequest(errorMsg));
        });
};

handler.getMyFollower = (request, reply) => {

    getFollowerByUserId(request, reply, request.requestingUserId);

};
handler.getFollowerByUser = (request, reply) => {

    getFollowerByUserId(request, reply, request.params.userId);

};

handler.protected = (request, reply) => {
    reply('YOU CAN SEE THIS');
};


module.exports = handler;