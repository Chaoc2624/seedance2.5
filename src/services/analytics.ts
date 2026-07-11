import {
  AnalyticsManager,
  ClarityAnalyticsProvider,
  GoogleAnalyticsProvider,
  PlausibleAnalyticsProvider,
} from '@/extensions/analytics';

type Configs = Record<string, string>;

export function getAnalyticsManagerWithConfigs(configs: Configs) {
  const analytics = new AnalyticsManager();

  if (configs.google_analytics_id) {
    analytics.addProvider(
      new GoogleAnalyticsProvider({ gaId: configs.google_analytics_id })
    );
  }

  if (configs.clarity_id) {
    analytics.addProvider(
      new ClarityAnalyticsProvider({ clarityId: configs.clarity_id })
    );
  }

  if (configs.plausible_script_id) {
    analytics.addProvider(
      new PlausibleAnalyticsProvider({
        scriptId: configs.plausible_script_id,
      })
    );
  }

  return analytics;
}

let analyticsService: AnalyticsManager | null = null;

export async function getAnalyticsService(
  configs?: Configs
): Promise<AnalyticsManager> {
  if (!configs) {
    const { getAllConfigs } = await import('@/models/config.server');
    configs = await getAllConfigs();
  }
  analyticsService = getAnalyticsManagerWithConfigs(configs);
  return analyticsService;
}
