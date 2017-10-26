'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { omitDefaultRequestParams, constructError } = require('./utils');
const { event: parser } = require('../response-parsers');

const qsValidParameters = [
  'eventInstUuid', // Not an optional parameter. The uuid of required event instance.
];

/**
 * Retrieve single event instance.
 *
 * @param  {Object}   query                   Query object that holds information required by request uri.
 * @param  {Object}   query.eventInstUuid     The uuid of required event instance.
 * @param  {Object}   options                 Additional information used as default for every request options.
 * @param  {Function} callback                [description]
 */
function event(query = {}, options, callback) {
  const { httpClient } = this;

  const { eventInstUuid } = query;
  if (!eventInstUuid) {
    const error = constructError('{{query.eventInstUuid}} must be defined in [event] request', 404);
    callback(error);
    return;
  }

  // construct the request options
  const requestOptions = _.merge({}, omitDefaultRequestParams(options), {
    qs: _.pick(query, qsValidParameters),
    headers: {
      accept: 'application/atom+xml',
    },
    uri: 'calendar/{ authType }/atom/calendar/event',
  });

  httpClient.makeRequest(requestOptions, (requestError, response, body) => {
    if (requestError) {
      callback(requestError);
      return;
    }

    const { statusCode, headers: { 'content-type': contentType } } = response;
    // expected
    // status codes: 200, 400, 401, 403, 404
    // content-type: application/atom+xml
    if (!response || statusCode !== 200) {
      const error = constructError(body || 'received response with unexpected status code', statusCode);
      callback(error);
      return;
    }

    if (!(response.headers && contentType.startsWith('application/atom+xml'))) {
      const error = constructError(`received response with unexpected content-type ${contentType}`, 401);
      callback(error);
      return;
    }

    callback(null, parser(body));
  });
}

module.exports = event;
