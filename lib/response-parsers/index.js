'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { ensureXMLDoc } = require('oniyi-utils-xml');

// internal modules
const eventEntryParser = require('./event-entry');
const attendeesEntryParser = require('./attendee-entry');
const xpathSelect = require('../xpath-select');

module.exports = {
  events: (stringOrXMLDoc) => {
    const xmlDoc = ensureXMLDoc(stringOrXMLDoc);

    return _.map(xpathSelect('/atom:feed/atom:entry', xmlDoc), entryNode => eventEntryParser(entryNode));
  },
  attendees: (stringOrXMLDoc) => {
    const xmlDoc = ensureXMLDoc(stringOrXMLDoc);

    return _.map(xpathSelect('/atom:feed/atom:entry', xmlDoc), entryNode => attendeesEntryParser(entryNode));
  },
  event: (stringOrXMLDoc) => {
    const xmlDoc = ensureXMLDoc(stringOrXMLDoc);

    const eventEntry = xpathSelect('/atom:entry', xmlDoc, true);
    return eventEntryParser(eventEntry);
  },
};
