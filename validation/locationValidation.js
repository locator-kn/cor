'use strict';
const Joi = require('joi');
let validations = {};

validations.nearbyQuery = Joi.object().keys({
    long: Joi.number().required().default(9.169753789901733),
    lat: Joi.number().required().default(47.66868204997508),
    maxDistance: Joi.number().default(2),
    limit: Joi.number().default(20)
});

validations.postSchoenhier = Joi.object().keys({
    long: Joi.number().required().default(9.169753789901733),
    lat: Joi.number().required().default(47.66868204997508)
});

module.exports = validations;