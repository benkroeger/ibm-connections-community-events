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
    defaults: {},
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
      'content',
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
    recurrenceProps: ['frequency', 'interval', 'until', 'startDate', 'endDate', 'byDay', 'allday'],
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

/* Successful scenarios validations */

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

  service.events(query, {}, (err, results) => {
    t.ifError(err);
    const { totalResults, entries: events } = results;
    t.is(totalResults, 32);
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

test.cb('validate retrieving community events => calendarUuid & startDate & autType provided', (t) => {
  const {
    service, eventsProps: {
      firstLvlProps, userProps, linksProps, sourceProps,
    },
  } = t.context;

  const query = {
    calendarUuid: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
    startDate: '2017-01-04T20:32:31.171Z',
  };

  service.events(query, { authType: 'oauth' }, (err, results) => {
    t.ifError(err);
    const { totalResults, entries: events } = results;

    t.is(totalResults, 32);
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

test.cb('validate retrieving community event instance => eventInstUuid provided', (t) => {
  const {
    service, eventsProps: {
      firstLvlProps, userProps, linksProps, sourceProps, recurrenceProps,
    },
  } = t.context;

  const query = {
    eventInstUuid: 'f9e305c4-2e02-43c6-ba4e-3b65ad9f072c',
  };

  service.event(query, {}, (err, event) => {
    t.ifError(err);
    firstLvlProps.forEach(prop => t.true(prop in event, `[${prop}] should be a member of an event`));
    const {
      author, contributor, links, source, tags, allday, published, updated, startDate, endDate, recurrence, content,
    } = event;

    [author, contributor, links, source, recurrence].forEach(elem => t.true(_.isPlainObject(elem)));
    t.true(_.isArray(tags));
    t.true(_.isBoolean(allday));
    t.true(_.isDate(new Date(published)));
    t.true(_.isDate(new Date(updated)));
    t.true(_.isDate(new Date(startDate)));
    t.true(_.isDate(new Date(endDate)));
    t.true(_.isString(content) && !_.isEmpty(content));

    recurrenceProps.forEach(prop => t.true(prop in recurrence, `[${prop}] should be a member of event.recurrence`));
    userProps.forEach(prop => t.true(prop in author, `[${prop}] should be a member of event.author`));
    userProps.forEach(prop => t.true(prop in contributor, `[${prop}] should be a member of event.contributor`));
    linksProps.forEach(prop => t.true(prop in links, `[${prop}] should be a member of event.links`));
    sourceProps.forEach(prop => t.true(prop in source, `[${prop}] should be a member of event.source`));
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

  service.attendees(query, { /* options */ }, (err, results) => {
    t.ifError(err);

    const { totalResults, entries: attendees } = results;
    t.is(totalResults, 1);
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

test.cb('validate retrieving events attendees => eventInstUuid & authType provided', (t) => {
  const {
    service, attendeesProps: {
      firstLvlProps, userProps, linksProps, sourceProps,
    },
  } = t.context;

  const query = {
    eventInstUuid: '2c688d78-5a78-42b2-a2dd-bd5f5493fdc2',
  };

  service.attendees(query, { authType: 'oauth' }, (err, results) => {
    t.ifError(err);
    const { totalResults, entries: attendees } = results;
    t.is(totalResults, 1);
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

/* Error / Wrong input scenarios validations */

test.cb('error validation of retrieving community events => calendarUuid not provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    startDate: '2017-01-04T20:32:31.171Z',
  };

  service.events(query, { /* options */ }, (err) => {
    t.is(err.httpStatus, 404);
    t.is(err.message, '{{query.calendarUuid}} must be defined in [events] request');
    t.end();
  });
});

test.cb('error validation of retrieving community events => startDate not provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    calendarUuid: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
  };

  service.events(query, { /* options */ }, (err) => {
    t.is(err.httpStatus, 404);
    t.is(err.message, '{{query.startDate}} or {{query.endDate}} must be defined in [events] request');
    t.end();
  });
});

test.cb('error validation of retrieving community events => not valid calendarUuid provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    calendarUuid: 'wrong calendarUuid',
    startDate: '2017-01-04T20:32:31.171Z',
  };

  service.events(query, { /* options */ }, (err) => {
    t.is(err.httpStatus, 404);
    t.is(err.message, 'received response with unexpected status code');
    t.end();
  });
});

test.cb('error validation of retrieving community events => not valid startDate provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    calendarUuid: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
    startDate: 'wrong date',
  };

  service.events(query, { /* options */ }, (err) => {
    t.true(err.message.includes('Invalid value specified for URL parameter startDate'));
    t.is(err.httpStatus, 400);
    t.end();
  });
});

test.cb('error validation of retrieving community attendees => eventInstUuid not provided', (t) => {
  const {
    service,
  } = t.context;

  service.attendees({/* query */}, { /* options */ }, (err) => {
    t.is(err.httpStatus, 404);
    t.is(err.message, '{{query.eventInstUuid}} must be defined in [events] request');
    t.end();
  });
});

test.cb('error validation of retrieving community events => wrong authType provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    calendarUuid: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
    startDate: '2017-01-04T20:32:31.171Z',
  };
  const authType = 'wrong';

  service.events(query, { authType }, (err) => {
    t.is(err.httpStatus, 404);
    t.true(err.message.includes(authType));
    t.end();
  });
});

test.cb('error validation of retrieving community event attendees => wrong authType provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    eventInstUuid: '2c688d78-5a78-42b2-a2dd-bd5f5493fdc2',
  };
  const authType = 'wrong';

  service.attendees(query, { authType }, (err) => {
    t.is(err.httpStatus, 404);
    t.true(err.message.includes(authType));
    t.end();
  });
});

test.cb('error validation of retrieving community event instance => wrong eventInstUui provided', (t) => {
  const {
    service,
  } = t.context;

  const query = {
    eventInstUuid: 'wrong eventInstUuid',
  };

  service.event(query, {}, (err) => {
    t.is(err.httpStatus, 404);
    t.is(err.message, 'received response with unexpected status code');
    t.end();
  });
});

test.cb('error validation of retrieving community event instance => no eventInstUui provided', (t) => {
  const {
    service,
  } = t.context;

  service.event({/* query */}, {/* options */}, (err) => {
    t.is(err.httpStatus, 404);
    t.is(err.message, '{{query.eventInstUuid}} must be defined in [event] request');
    t.end();
  });
});
