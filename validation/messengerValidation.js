'use strict';
const Joi = require('joi');

let validations = {};


validations.conversationId = Joi.object().keys({
    conversationId: Joi.string().required()
});

validations.dataPaged = Joi.object().keys({
    page: Joi.number().default(0),
    elements: Joi.number().default(20)
});

module.exports = validations;