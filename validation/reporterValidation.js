'use strict';
const Joi = require('joi');
let validations = {};

validations.userId = {
    userId: Joi.string().required()
};

module.exports = validations;