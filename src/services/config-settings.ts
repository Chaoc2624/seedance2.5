export type DevConfigTabName = 'site' | 'analytics' | 'ads';

export interface DevConfigTab {
  name: DevConfigTabName;
  title: string;
}

export interface DevConfigGroup {
  name: string;
  title: string;
  description: string;
  tab: DevConfigTabName;
}

export interface DevConfigField {
  name: string;
  envName: string;
  title: string;
  placeholder?: string;
  tip?: string;
  tab: DevConfigTabName;
  group: string;
  inputMode?: 'text' | 'url';
  restartRecommended?: boolean;
}

export const devConfigTabs: DevConfigTab[] = [
  {
    name: 'site',
    title: 'Site',
  },
  {
    name: 'analytics',
    title: 'Analytics',
  },
  {
    name: 'ads',
    title: 'Ads',
  },
];

export const devConfigGroups: DevConfigGroup[] = [
  {
    name: 'site',
    title: 'Site runtime',
    description: 'Public site values used by local SSR and deployment config.',
    tab: 'site',
  },
  {
    name: 'google',
    title: 'Google',
    description: 'Analytics and Google site ownership verification.',
    tab: 'analytics',
  },
  {
    name: 'microsoft',
    title: 'Microsoft',
    description: 'Clarity analytics and Bing Webmaster verification.',
    tab: 'analytics',
  },
  {
    name: 'plausible',
    title: 'Plausible',
    description: 'Plausible Analytics script id.',
    tab: 'analytics',
  },
  {
    name: 'google_ads',
    title: 'Google Ads',
    description: 'AdSense and Google Funding Choices settings.',
    tab: 'ads',
  },
];

export const devConfigFields: DevConfigField[] = [
  {
    name: 'app_url',
    envName: 'VITE_APP_URL',
    title: 'App URL',
    placeholder: 'http://localhost:3000',
    tab: 'site',
    group: 'site',
    inputMode: 'url',
    restartRecommended: true,
  },
  {
    name: 'app_name',
    envName: 'VITE_APP_NAME',
    title: 'App Name',
    placeholder: 'Seedance 2.5',
    tab: 'site',
    group: 'site',
    restartRecommended: true,
  },
  {
    name: 'google_analytics_id',
    envName: 'GOOGLE_ANALYTICS_ID',
    title: 'GA4 Measurement ID',
    placeholder: 'G-XXXXXXXXXX',
    tab: 'analytics',
    group: 'google',
  },
  {
    name: 'google_search_console_id',
    envName: 'GOOGLE_SEARCH_CONSOLE_ID',
    title: 'Google Search Console ID',
    placeholder: 'google-site-verification content',
    tab: 'analytics',
    group: 'google',
  },
  {
    name: 'clarity_id',
    envName: 'CLARITY_ID',
    title: 'Microsoft Clarity ID',
    placeholder: 'clarity project id',
    tab: 'analytics',
    group: 'microsoft',
  },
  {
    name: 'plausible_script_id',
    envName: 'PLAUSIBLE_SCRIPT_ID',
    title: 'Plausible ID',
    placeholder: 'pa-xxxxxxxxxxxxxxxx',
    tip: 'Use the pa-xxxx id from your Plausible snippet.',
    tab: 'analytics',
    group: 'plausible',
  },
  {
    name: 'bing_webmaster_verification_id',
    envName: 'BING_WEBMASTER_VERIFICATION_ID',
    title: 'Bing Webmaster ID',
    placeholder: 'msvalidate.01 content',
    tab: 'analytics',
    group: 'microsoft',
  },
  {
    name: 'bing_indexnow_key',
    envName: 'BING_INDEXNOW_KEY',
    title: 'Bing IndexNow Key',
    placeholder: '142a3398041a443b8ededee3f65eeb05',
    tip: 'Builds generate public/<key>.txt with the key as its file content.',
    tab: 'analytics',
    group: 'microsoft',
    restartRecommended: true,
  },
  {
    name: 'adsense_code',
    envName: 'ADSENSE_CODE',
    title: 'AdSense Account',
    placeholder: 'ca-pub-xxxxxxxxxxxxxxxx',
    tab: 'ads',
    group: 'google_ads',
  },
  {
    name: 'google_funding_choices_id',
    envName: 'GOOGLE_FUNDING_CHOICES_ID',
    title: 'Google Funding Choices ID',
    placeholder: 'pub-xxxxxxxxxxxxxxxx or https://fundingchoicesmessages...',
    tip: 'Use the publisher id or the Funding Choices script URL.',
    tab: 'ads',
    group: 'google_ads',
  },
];

export const devConfigFieldNames = new Set(
  devConfigFields.map((field) => field.name)
);

export const devConfigEnvNames = devConfigFields.map((field) => field.envName);
