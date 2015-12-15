'use strict';
const Joi = require('joi');
let validations = {};

validations.getLocationsNearby = Joi.object().keys({
    long: Joi.number().required(),
    lat: Joi.number().required(),
    maxDistance: Joi.number(),
    limit: Joi.number()
});

validations.postSchoenhier = Joi.object().keys({
    long: Joi.number().required(),
    lat: Joi.number().required()
});

module.exports = validations;