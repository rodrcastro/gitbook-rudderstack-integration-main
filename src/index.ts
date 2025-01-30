import {
  createIntegration,
  RuntimeContext,
  RuntimeEnvironment
} from '@gitbook/runtime';

import generateRudderStackTrackEvent from './events';

type RudderStackRuntimeContext = RuntimeContext<
  RuntimeEnvironment<
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    {
      data_plane_url?: string;
      source_write_key?: string;
    }
  >
>;

export default createIntegration<RudderStackRuntimeContext>({
  events: {
    site_view: async (event, { environment }) => {
      console.log('site_view', event, environment);
      const writeKey =
        environment.siteInstallation?.configuration.source_write_key;
      if (!writeKey) {
        throw new Error(
          `The RudderStack source write key is missing from the Site (ID: ${event.siteId}) installation.`
        );
      }

      const dataPlaneUrl =
        environment.siteInstallation?.configuration.data_plane_url;
      if (!dataPlaneUrl) {
        throw new Error(
          `The RudderStack data plane URL is missing from the Site (ID: ${event.siteId}) installation.`
        );
      }

      const trackEvent = generateRudderStackTrackEvent(event);
      await fetch(`${dataPlaneUrl}/v1/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${writeKey}:`)}`
        },
        body: JSON.stringify(trackEvent)
      });
    }
  }
});
