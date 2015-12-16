'use strict';

const hoek = require('hoek');

let fns = {};

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