'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { parseXMLNode } = require('oniyi-utils-xml');

// internal modules
const {
  toDate, urnToId, parseUserInfo, toBoolean,
} = require('./utils');
const xPath = require('../xpath-select');

const linkRelToNameMap = {
  self: 'self',
  alternate: 'alternate',
  'http://www.ibm.com/xmlns/prod/sn/calendar/event/parentevent': 'parentevent',
  'http://www.ibm.com/xmlns/prod/sn/calendar/event/attend': 'attend',
  'http://www.ibm.com/xmlns/prod/sn/calendar/event/follow': 'follow',
  'http://www.ibm.com/xmlns/prod/sn/calendar/event/attendees': 'attendees',
  'http://www.ibm.com/xmlns/prod/sn/container': 'container',
};

// simple values selectors
const textValueSelectors = {
  id: {
    selector: 'string(atom:id)',
    transform: urnToId,
  },
  published: {
    selector: 'string(atom:published)',
    transform: toDate,
  },
  updated: {
    selector: 'string(atom:updated)',
    transform: toDate,
  },
  startDate: {
    selector: 'string(snx:startDate)',
    transform: toDate,
  },
  endDate: {
    selector: 'string(snx:endDate)',
    transform: toDate,
  },
  allday: {
    selector: 'number(snx:allday)',
    transform: toBoolean,
  },
  title: 'string(atom:title[@type="text"])',
  summary: 'string(atom:summary[@type="html"])',
  eventUuid: 'string(snx:eventUuid)',
  eventInstUuid: 'string(snx:eventInstUuid)',
  repeats: 'string(snx:repeats)',
  location: 'string(snx:location)',
  parentEvent: 'string(snx:parentEvent)',
  followed: 'string(snx:followed)',
  attended: 'string(snx:attended)',
  communityUuid: 'string(snx:communityUuid)',
};

const parseSource = node =>
  parseXMLNode(
    node,
    {
      id: 'string(atom:id)',
      title: 'string(atom:title[@type="text"])',
      edit: 'string(atom:link[@rel="edit" and @type="application/atom+xml"]/@href)',
      self: 'string(atom:link[@rel="self" and @type="application/atom+xml"]/@href)',
    },
    xPath
  );

// parsing links by assigning each link object to its 'rel' value
const parseLinks = nodes =>
  _.reduce(
    nodes,
    (result, node) => {
      const link = parseXMLNode(
        node,
        {
          rel: 'string(@rel)',
          type: 'string(@type)',
          href: 'string(@href)',
        },
        xPath
      );

      const { [link.rel || '']: name } = linkRelToNameMap;

      /* beautify preserve:start */
      return Object.assign(result, { [name]: link });
      /* beautify preserve:end */
    },
    {}
  );

const parseCategories = tags => _.map(tags, tag => tag.getAttribute('term'));

module.exports = (xmlNode) => {
  // collect all of the previous selectors/parsers into a one result object
  const result = _.assign(textValueSelectors, {
    source: {
      selector: 'atom:source',
      transform: parseSource,
    },
    tags: {
      selector: 'atom:category[@term and not(@scheme)]',
      multi: true,
      transform: parseCategories,
    },
    links: {
      selector: 'atom:link',
      multi: true,
      transform: parseLinks,
    },
    contributor: {
      selector: 'atom:contributor',
      transform: parseUserInfo,
    },
    author: {
      selector: 'atom:author',
      transform: parseUserInfo,
    },
  });

  return parseXMLNode(xmlNode, result, xPath);
};
