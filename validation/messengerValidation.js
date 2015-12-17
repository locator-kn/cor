'use strict';
const Joi = require('joi');

let validations = {};

validations.conversationId = Joi.object().keys({
    conversationId: Joi.string().required()
});

module.exports = validations;