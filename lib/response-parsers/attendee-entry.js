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
  'http://www.ibm.com/xmlns/prod/sn/container': 'container',
};

// simple values selectors
const textValueSelectors = {
  id: {
    selector: 'string(atom:id/text())',
    transform: urnToId,
  },
  updated: {
    selector: 'string(atom:updated)',
    transform: toDate,
  },
  title: 'string(atom:title[@type="text"]/text())',
  role: 'string(snx:role/text())',
  category : 'string(atom:category[@scheme="http://www.ibm.com/xmlns/prod/sn/type"]/@term())',
  communityUuid: 'string(snx:communityUuid/text())',
};

const parseSource = node => parseXMLNode(node, {
  id: 'string(atom:id/text())',
  title: 'string(atom:title[@type="text"]/text())',
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

module.exports = (xmlNode) => {
  // collect all of the previous selectors/parsers into a one result object
  const result = _.assign(textValueSelectors, {
    source: {
      selector: 'atom:source',
      transform: parseSource,
    },
    links: {
      selector: 'atom:link',
      multi: true,
      transform: parseLinks },
    author: {
      selector: 'atom:author',
      transform: parseUserInfo },
  });

  return parseXMLNode(xmlNode, result, xPath);
};
