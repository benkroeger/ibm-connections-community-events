// node core modules

// 3rd party modules
import test from 'ava';
import _ from 'lodash';

// internal modules
import communityEventsService from '../lib';
import { mock, record, persist } from './fixtures/http-mocking';

const { unmocked, username, password } = process.env;

test.before(() => (unmocked ? record() : mock()));
test.after(() => unmocked && persist());

test.beforeEach((t) => {
  const serviceOptions = {
    defaults: {
      authType: 'basic',
    },
  };
  if (unmocked) {
    Object.assign(serviceOptions.defaults, {
      auth: {
        user: username,
        pass: password,
      },
    });
  }
  const baseProps = ['id', 'title', 'communityUuid', 'source', 'links', 'author'];
  const userProps = ['name', 'userId', 'isExternal', 'email', 'userState'];
  const sourceProps = ['id', 'title', 'self'];

  const eventsProps = {
    firstLvlProps: [
      ...baseProps,
      'published',
      'summary',
      'eventUuid',
      'eventInstUuid',
      'repeats',
      'location',
      'parentEvent',
      'followed',
      'attended',
      'tags',
      'contributor',
      'allday',
      'endDate',
      'startDate',
      'updated',
    ],
    userProps,
    linksProps: ['self', 'alternate', 'parentevent', 'attend', 'follow', 'attendees', 'container'],
    sourceProps: [...sourceProps, 'edit'],
  };
  const attendeesProps = {
    firstLvlProps: [...baseProps, 'role'],
    userProps,
    linksProps: ['self', 'container'],
    sourceProps,
  };

  const service = communityEventsService('https://apps.na.collabserv.com/communities', serviceOptions);
  _.assign(t.context, {
    service,
    serviceOptions,
    eventsProps,
    attendeesProps,
  });
});

test.cb('validate retrieving community events => calendarUuid & startDate provided', (t) => {
  const {
    service, eventsProps: {
      firstLvlProps, userProps, linksProps, sourceProps,
    },
  } = t.context;

  const query = {
    calendarUuid: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
    startDate: '2017-01-04T20:32:31.171Z',
  };

  service.events(query, {}, (err, events) => {
    t.ifError(err);
    t.true(_.isArray(events));
    events.forEach((event, i) => {
      firstLvlProps.forEach(prop => t.true(prop in event, `[${prop}] should be a member of events[${i}]`));
      const {
        author, contributor, links, source, tags, allday, published, updated, startDate, endDate,
      } = event;

      [author, contributor, links, source].forEach(elem => t.true(_.isPlainObject(elem)));
      t.true(_.isArray(tags));
      t.true(_.isBoolean(allday));
      t.true(_.isDate(new Date(published)));
      t.true(_.isDate(new Date(updated)));
      t.true(_.isDate(new Date(startDate)));
      t.true(_.isDate(new Date(endDate)));

      userProps.forEach(prop => t.true(prop in author, `[${prop}] should be a member of event.author`));
      userProps.forEach(prop => t.true(prop in contributor, `[${prop}] should be a member of event.contributor`));
      linksProps.forEach(prop => t.true(prop in links, `[${prop}] should be a member of event.links`));
      sourceProps.forEach(prop => t.true(prop in source, `[${prop}] should be a member of event.source`));
    });
    t.end();
  });
});
test.cb('validate retrieving events attendees => eventInstUuid provided', (t) => {
  const {
    service, attendeesProps: {
      firstLvlProps, userProps, linksProps, sourceProps,
    },
  } = t.context;

  const query = {
    eventInstUuid: '2c688d78-5a78-42b2-a2dd-bd5f5493fdc2',
  };

  service.attendees(query, {}, (err, attendees) => {
    t.ifError(err);
    t.true(_.isArray(attendees));

    attendees.forEach((attendee, i) => {
      firstLvlProps.forEach(prop => t.true(prop in attendee, `[${prop}] should be a member of attendees[${i}]`));
      const { author, links, source } = attendee;
      [author, links, source].forEach(elem => t.true(_.isPlainObject(elem)));

      userProps.forEach(prop => t.true(prop in author, `[${prop}] should be a member of attendee.author`));
      linksProps.forEach(prop => t.true(prop in links, `[${prop}] should be a member of attendee.links`));
      sourceProps.forEach(prop => t.true(prop in source, `[${prop}] should be a member of attendee.source`));
    });
    t.end();
  });
});
