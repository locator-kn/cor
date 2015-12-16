'use strict';

const hoek = require('hoek');

let fns = {};


/**
 * build a seneca command pattern for seneca.act
 * @param individualPattern {string|object} name of cmd or object
 * @param data {object} data object to attach to the data property
 * @param basicPin {object} role object
 * @returns {object}
 */
fns.setupSenecaPattern = (individualPattern, data, basicPin) => {
    let requestPattern = {};
    if(typeof individualPattern === 'string') {
        requestPattern.cmd = individualPattern;
    } else {
        requestPattern = individualPattern;
    }
    requestPattern.data = data;
    return hoek.merge(requestPattern, basicPin);
};

module.exports = fns;