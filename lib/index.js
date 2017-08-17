'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const OniyiHttpClient = require('oniyi-http-client');
const credentialsPlugins = require('oniyi-http-plugin-credentials');
const formatUrlTemplatePlugins = require('oniyi-http-plugin-format-url-template');

// internal modules
const methods = require('./methods');

/**
 * The factory function exported by the ibm-connections-community-events module which returns an instance of the [IbmConnectionsCommunityEventsService].
 *
 * @param   {String} baseUrl                                   The base URL of the IBM Connections Cloud instance with which the service will be communicating.
 * @param   {Object} serviceOptions                            An object of key-value pairs to set as defaults for the service.
 * @param   {String} [serviceOptions.accessToken]              An OAuth access token for the IBM Connections Cloud instance with which the service will be communicating.
 *                                                             If you provide this, it will be provided as a bearer token in the Authorization header on every request you
 *                                                             make with the service.
 * @param   {Object} [serviceOptions.headers]                  An object of key-value pairs, where a key is a HTTP header name and the corresponding value is the value for
 *                                                             the HTTP header. These headers and their values will be attached to every request the service makes.
 */
module.exports = (baseUrl, serviceOptions) => {
  const defaultHeaders = {
    defaults: {
      headers: serviceOptions && serviceOptions.headers,
    },
  };
  // params we'll use across the module
  const params = _.merge({
    defaults: {
      authType: 'oauth',
      baseUrl: baseUrl.charAt(baseUrl.length - 1) === '/' ? baseUrl : `${baseUrl}/`,
    },
  },
    defaultHeaders,
    serviceOptions);

  // create a http client to be used throughout this service
  const httpClient = new OniyiHttpClient(params);
  const { plugins = {} } = params;

  if (plugins.credentials) {
    httpClient.use(credentialsPlugins(plugins.credentials));
  }

  const formatUrlTemplateOptions = _.merge({
    valuesMap: {
      authType: {
        saml: '',
        cookie: '',
      },
    },
  }, plugins.formatUrlTemplate || {});

  httpClient.use(formatUrlTemplatePlugins(plugins.formatUrlTemplate));

  const service = {};

  Object.defineProperty(service, 'params', { value: params });
  Object.defineProperty(service, 'httpClient', { value: httpClient });

  _.assign(service, methods);

  return service;
};
