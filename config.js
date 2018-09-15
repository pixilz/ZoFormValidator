'use strict';

/**
 * @property env
 * @property port
 * @property type
 * @property log-connections
 * @property source-maps
 */
let config = {};

config.env = process.env.NODE_ENV;

Object.assign(config, require('./config/config.global.json'));

if (config.env !== 'production') {
  Object.assign(config, require('./config/config.development.json'));
} else {
  Object.assign(config, require('./config/config.production'));
}

module.exports = config;
