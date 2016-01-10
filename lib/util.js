'use strict';

const hoek = require('hoek');

let fns = {};


/**
 * build a seneca command pattern for seneca.act
 * @param cmdOrMoreComplexObject {string|object} name of cmd or object
 * @param data {object} data object to attach to the data property
 * @param basicPin {object} role object
 * @returns {object}
 */
fns.setupSenecaPattern = (cmdOrMoreComplexObject, data, basicPin) => {
    let requestPattern = {};
    if(typeof cmdOrMoreComplexObject === 'string') {
        requestPattern.cmd = cmdOrMoreComplexObject;
    } else {
        requestPattern = cmdOrMoreComplexObject;
    }
    requestPattern.data = data;
    return hoek.merge(requestPattern, basicPin);
};

/**
 * helper to extract the userid from request.auth
 * @param requestAuth {object} request.auth from hapis route handler
 * @returns {string} userid (_id) or unknown if not authenticated
 */
fns.getUserId = requestAuth => {
    return requestAuth.credentials && requestAuth.credentials._id ? requestAuth.credentials._id : 'unknown';
};

module.exports = fns;