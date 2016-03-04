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
    if (typeof cmdOrMoreComplexObject === 'string') {
        requestPattern.cmd = cmdOrMoreComplexObject;
    } else {
        requestPattern = cmdOrMoreComplexObject;
    }
    requestPattern.data = data;
    return hoek.merge(requestPattern, basicPin);
};

fns.clone = hoek.clone;

/**
 * helper to extract the userid from request.auth
 * @param requestAuth {object} request.auth from hapis route handler
 * @returns {string} userid (_id) or unknown if not authenticated
 */
fns.getUserId = requestAuth => {
    if (Array.isArray(requestAuth.credentials)) {
        return requestAuth.credentials[0] &&
        requestAuth.credentials[0][0] &&
        requestAuth.credentials[0][0]._id ? requestAuth.credentials[0][0]._id : 'unknown';
    }
    return requestAuth.credentials._id ? requestAuth.credentials._id : 'unknown';
};

/**
 * helper to extract the device from request.state
 * @param requestState {object} request.state from hapis route handler
 * @returns {string} device ID (device_id) or unknown if there is no cookie
 */
fns.getDeviceId = requestState => {
    return requestState['locator'] && requestState['locator'].device_id ? requestState['locator'].device_id : 'unknown';
};

module.exports = fns;
