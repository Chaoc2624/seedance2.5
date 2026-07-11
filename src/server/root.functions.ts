import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/start-server-core';

import { normalizeHeaderPosition } from '@/config/layout';
import { getRuntimeConfig } from '@/config/runtime.server';

import { isLocalHost } from '@/lib/local-host';

const emptyRootLoaderData = {
  gscId: '',
  bingWebmasterVerificationId: '',
  googleAnalyticsId: '',
  clarityId: '',
  plausibleScriptId: '',
  adsenseCode: '',
  googleFundingChoicesId: '',
};

function isLocalRootRequest() {
  const headers = getRequestHeaders();
  const host =
    headers.get('x-forwarded-host') ||
    headers.get('host') ||
    headers.get('origin') ||
    headers.get('referer');

  return isLocalHost(host);
}

export const getRootLoaderDataFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (isLocalRootRequest()) {
      return emptyRootLoaderData;
    }

    const configs = await getRuntimeConfig();
    return {
      gscId: configs.google_search_console_id || '',
      bingWebmasterVerificationId: configs.bing_webmaster_verification_id || '',
      googleAnalyticsId: configs.google_analytics_id || '',
      clarityId: configs.clarity_id || '',
      plausibleScriptId: configs.plausible_script_id || '',
      adsenseCode: configs.adsense_code || '',
      googleFundingChoicesId: configs.google_funding_choices_id || '',
    };
  }
);

export const getLandingLayoutDataFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const configs = await getRuntimeConfig();
    return {
      headerPosition: normalizeHeaderPosition(configs.layout_header_position),
    };
  }
);
