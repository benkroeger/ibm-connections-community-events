'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { omitDefaultRequestParams, constructError } = require('./utils');
const { events: parser } = require('../response-parsers');

const qsValidParameters = [
  'calendarUuid', // Not an optional parameter. The uuid of community that you want to query about.
  'startDate', // Optional if 'endDate' included in request. Otherwise not an optional parameter.
  // Includes in the resulting feed all those event instances that end after a specified date
  'endDate', // Optional if 'startDate' included in request. Otherwise not an optional parameter.
  // Includes in the resulting feed all those event instances that end before a specified date
  'page', // Page number, default is 1
  'ps', // Page size, default is 10
  'tags', // Filters the list of results by tag
];

/**
 * Retrieve all events by provided calendar id.
 *
 * @param  {Object}   query                   Query object that holds information required by request uri.
 * @param  {Object}   query.calendarUuid      The unique uuid of the community.
 * @param  {Object}   options                 Additional information used as default for every request options.
 * @param  {Function} callback                [description]
 */
function events(query = {}, options, callback) {
  const { httpClient } = this;

  // construct the request options
  const requestOptions = _.merge({}, omitDefaultRequestParams(options), {
    qs: _.pick(query, qsValidParameters),
    headers: {
      accept: 'application/atom+xml',
    },
    uri: 'calendar/atom/calendar/event',
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

module.exports = events;
