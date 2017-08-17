'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { ensureXMLDoc } = require('oniyi-utils-xml');

// internal modules
const calendarEntryParser = require('./event-entry');
const attendeesEntryParser = require('./attendee-entry');
const xpathSelect = require('../xpath-select');


module.exports =  {
  events: (stringOrXMLDoc) => {
    const xmlDoc = ensureXMLDoc(stringOrXMLDoc);

    return _.map(xpathSelect('/atom:feed/atom:entry', xmlDoc), entryNode =>
      calendarEntryParser(entryNode));
  },
  attendees: (stringOrXMLDoc) => {
    const xmlDoc = ensureXMLDoc(stringOrXMLDoc);

    return _.map(xpathSelect('/atom:feed/atom:entry', xmlDoc), entryNode =>
      attendeesEntryParser(entryNode));
  },
};
