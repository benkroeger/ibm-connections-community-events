'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { parseXMLNode } = require('oniyi-utils-xml');

// internal modules
const { toDate, urnToId, parseUserInfo } = require('./utils');
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
    selector: 'string(atom:id/text())',
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
  title: 'string(atom:title[@type="text"]/text())',
  summary: 'string(atom:summary[@type="html"]/text())',
  eventUuid: 'string(snx:eventUuid/text())',
  eventInstUuid: 'string(snx:eventInstUuid/text())',
  endDate: 'string(snx:endDate/text())',
  repeats: 'string(snx:repeats/text())',
  location: 'string(snx:location/text())',
  allday: 'boolean(snx:allday/text())',
  parentEvent: 'string(snx:parentEvent/text())',
  followed: 'string(snx:followed/text())',
  attended: 'string(snx:attended/text())',
  communityUuid: 'string(snx:communityUuid/text())',
};

const parseSource = node => parseXMLNode(node, {
  id: 'string(atom:id/text())',
  title: 'string(atom:title[@type="text"]/text())',
  edit: 'string(atom:link[@rel="edit" and @type="application/atom+xml"]/@href)',
  self: 'string(atom:link[@rel="self" and @type="application/atom+xml"]/@href)',
}, xPath);

// parsing links by assigning each link object to its 'rel' value
const parseLinks = nodes => _.reduce(nodes, (result, node) => {
  const link = parseXMLNode(node, {
    rel: 'string(@rel)',
    type: 'string(@type)',
    href: 'string(@href)',
  }, xPath);

  const { [link.rel || '']: name } = linkRelToNameMap;

  /* beautify preserve:start */
  return Object.assign(result, { [name]: link });
  /* beautify preserve:end */
}, {});

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
      transform: nodes => parseCategories },
    links: {
      selector: 'atom:link',
      multi: true,
      transform: parseLinks },
    contributor: {
      selector: 'atom:contributor',
      transform: parseUserInfo },
    author: {
      selector: 'atom:author',
      transform: parseUserInfo },
  });

  return parseXMLNode(xmlNode, result, xPath);
};
