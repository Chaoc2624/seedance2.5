import {
  AdsenseProvider,
  AdsManager,
  GoogleFundingChoicesProvider,
} from '@/extensions/ads';

import { Configs, getAllConfigs } from '@/models/config.server';

/**
 * get ads manager with configs
 */
export function getAdsManagerWithConfigs(configs: Configs) {
  const ads = new AdsManager();

  // adsense
  if (configs.adsense_code) {
    ads.addProvider(new AdsenseProvider({ adId: configs.adsense_code }));
  }

  if (configs.google_funding_choices_id) {
    ads.addProvider(
      new GoogleFundingChoicesProvider({
        publisherId: configs.google_funding_choices_id,
      })
    );
  }

  return ads;
}

/**
 * global ads service
 */
let adsService: AdsManager | null = null;

/**
 * get ads service instance
 */
export async function getAdsService(configs?: Configs): Promise<AdsManager> {
  if (!configs) {
    configs = await getAllConfigs();
  }
  adsService = getAdsManagerWithConfigs(configs);

  return adsService;
}
