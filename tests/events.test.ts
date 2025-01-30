import * as assert from 'assert';
import test from 'test';

import * as api from '@gitbook/api';

import packageJson from '../package.json';
// eslint-disable-next-line import/no-internal-modules
import generateRudderStackTrackEvent from '../src/events';

const fakeSpaceViewEvent: api.SpaceViewEvent = {
  eventId: 'fake-event-id',
  type: 'space_view',
  spaceId: 'fake-space-id',
  pageId: 'fake-page-id',
  installationId: 'fake-installation-id',
  visitor: {
    anonymousId: 'gitbookAnonymousId',
    userAgent: 'fake-user-agent',
    ip: '127.0.0.1',
    cookies: {
      fake_cookie: 'cookie'
    }
  },
  url: 'https://docs.gitbook.com/integrations?utm_source=gitbook',
  referrer: 'https://www.gitbook.com/'
};

describe('events', () => {
  it('should generate the Segment Track Event with expected properties', () => {
    const expectedRudderEvent = {
      event: 'GitBook Space Viewed',
      anonymousId: 'gitbookAnonymousId',
      context: {
        library: {
          name: 'GitBook',
          version: packageJson.version
        },
        page: {
          referrer: 'https://www.gitbook.com/',
          path: '/integrations',
          search: '?utm_source=gitbook',
          url: 'https://docs.gitbook.com/integrations?utm_source=gitbook'
        },
        userAgent: 'fake-user-agent',
        ip: '127.0.0.1'
      },
      properties: {
        spaceId: 'fake-space-id',
        pageId: 'fake-page-id'
      }
    };
    const actualSegmentEvent =
      generateRudderStackTrackEvent(fakeSpaceViewEvent);

    expect(actualSegmentEvent.event).toEqual(expectedRudderEvent.event);
  });

  it('should send the Segment rl_anonymous_id cookie value as anonymousId when present', async () => {
    const { visitor, ...restSpaceViewEvent } = fakeSpaceViewEvent;
    const { cookies, ...restVisitor } = visitor;
    const rudderEvent = generateRudderStackTrackEvent({
      ...restSpaceViewEvent,
      visitor: {
        ...restVisitor,
        cookies: {
          ...cookies,
          rl_anonymous_id:
            'RudderEncrypt%3AU2FsdGVkX1%2BTygo44D4JgDl6Pb2i9l9EAXfm%2F3s1VMqnB%2B%2F3wbubgC8GrX%2FF7StppeGgQH%2B6k%2F6EEoAMP6dvIQ%3D%3D'
        }
      }
    });
    expect(rudderEvent.anonymousId).toEqual(
      'b522b966-5a24-49e1-906c-7d059f2cd810'
    );
  });

  it('should fallback to sending GitBook anonymousId value as anonymousId when ajs_anonymous_id is not present', async () => {
    const rudderEvent = generateRudderStackTrackEvent(fakeSpaceViewEvent);
    expect(rudderEvent.anonymousId).toEqual('gitbookAnonymousId');
  });
});
