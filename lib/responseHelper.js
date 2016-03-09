'use strict';

const Boom = require('boom');
const log = require('ms-utilities').logger;

const fns = {};

const ERRORS = {
    'NOT_FOUND': Boom.notFound,
    'LOGIN_FAILED': Boom.unauthorized,
    'USER_EXISTS': Boom.conflict,
    'SELF_FOLLOW': Boom.badRequest,
    'MISSING_ID': Boom.notFound,
    'INVALID_ID': Boom.badRequest,
    'USER_NOT_FOUND': Boom.badRequest,
    'ILLEGAL_OPERATION': Boom.badRequest
};


/**
 * Will receive a object like:
 * {
 *  error: {
 *      msg: 'NOT_FOUND',
 *      detail: 'something was not found'
 *    },
 *  data: null
 * }
 * @param serviceResponse
 * @returns {*}
 */
fns.unwrap = (serviceResponse) => {
    if (serviceResponse && !serviceResponse.err && serviceResponse.data) {

        return serviceResponse.data;

    }

    if (serviceResponse && serviceResponse.err) {

        // get boom function
        let boom = ERRORS[serviceResponse.err.msg];

        if (!boom) {
            log.fatal('No boom object found for :', serviceResponse.err);
            return Boom.badImplementation();
        }

        // return boom function with (optional) message
        return boom(serviceResponse.err.detail);
    }

    // service response is not defined
    log.fatal('micro service response is undefined!!');
    return Boom.badImplementation();

};


module.exports = fns;
