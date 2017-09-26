'use strict';

// node core modules

// 3rd party modules
const { parseXMLNode } = require('oniyi-utils-xml');

// internal modules
const xpath = require('../xpath-select');

const urnRegexp = /([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})$/;

const urnToId = (val) => {
  const [, id] = val.match(urnRegexp);
  return id;
};

const toDate = val => val && Date.parse(val);

const toBoolean = item => !!item;

const parseUserInfo = node => parseXMLNode(node, {
  name: 'string(atom:name)',
  userId: 'string(snx:userid)',
  userState: 'string(snx:userState)',
  email: 'string(atom:email)',
  isExternal: 'boolean(snx:isExternal)',
}, xpath);

module.exports = {
  urnToId,
  toDate,
  parseUserInfo,
  toBoolean,
};
