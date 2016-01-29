'use strict';

const Boom = require('boom');

const fns = {};

const ERRORS = {
    'NOT_FOUND': Boom.notFound()
};


fns.unwrap = (serviceResponse) => {
    if (serviceResponse.error) {
        let err = ERRORS[serviceResponse.error.msg];
        if(!err) {
            err = Boom.badImplementation();
        }
        return err;
    }
    return serviceResponse.data;
};


module.exports = fns;
