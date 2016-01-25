'use strict';
const Joi = require('joi');
let validations = {};

validations.register = Joi.object().keys({
    deviceId: Joi.string().required(),
    type: Joi.string().required().valid(['ios', 'android']),
    version: Joi.string().required(),
    deviceModel: Joi.string().required()
});

validations.pushInfo = Joi.object().keys({
    pushToken: Joi.string().required(),
    version: Joi.string().required()
});

module.exports = validations;
