'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { omitDefaultRequestParams, constructError } = require('./utils');
const { attendees: parser } = require('../response-parsers');

const qsValidParameters = [
  'eventInstUuid',    // Not an optional parameter. The uuid of event instance that you want to query about
  'type',             // Not an optional parameter. Should always be "attend"
  'page',             // Page number, default is 1
  'ps',               // Page size, default is 10
];

/**
 * Retrieve files that belong to a user.
 *
 * @param  {Object}   query                   Query object that holds information required by request uri.
 * @param  {Object}   options                 Additional information used as default for every request options.
 * @param  {Function} callback                [description]
 */
function myFiles(query = {}, options, callback) {
  const { httpClient } = this;

  // construct the request options
  const requestOptions = _.defaultsDeep({
    qs: {
      type: 'attend',
    },
  }, omitDefaultRequestParams(options), {
    qs: _.pick(query, qsValidParameters),
    headers: {
      accept: 'application/atom+xml',
    },
    uri: 'calendar/atom/calendar/event/attendees',
  });

  httpClient.makeRequest(requestOptions, (requestError, response, body) => {
    if (requestError) {
      callback(requestError);
      return;
    }

    const { statusCode, headers: { 'content-type': contentType } } = response;
    // expected
    // status codes: 200, 403, 404
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

module.exports = myFiles;
