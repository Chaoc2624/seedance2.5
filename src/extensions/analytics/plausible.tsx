import { ReactNode } from 'react';

import Script from '@/components/script';

import { AnalyticsConfigs, AnalyticsProvider } from '.';

/**
 * Plausible analytics configs
 * @docs https://plausible.io/docs/plausible-script
 */
export interface PlausibleAnalyticsConfigs extends AnalyticsConfigs {
  scriptId: string;
}

/**
 * Plausible analytics provider
 * @website https://plausible.io/
 */
export class PlausibleAnalyticsProvider implements AnalyticsProvider {
  readonly name = 'plausible';

  configs: PlausibleAnalyticsConfigs;

  constructor(configs: PlausibleAnalyticsConfigs) {
    this.configs = configs;
  }

  private getScriptSrc() {
    const normalizedScriptId = this.configs.scriptId
      .trim()
      .replace(/^\/?js\//, '')
      .replace(/\.js$/, '');

    return `https://plausible.io/js/${normalizedScriptId}.js`;
  }

  getHeadScripts(): ReactNode {
    const scriptSrc = this.getScriptSrc();

    return (
      <>
        <Script
          id={`${this.name}-script`}
          src={scriptSrc}
          strategy="afterInteractive"
          async
        />
        <Script
          id={`${this.name}-init`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
              plausible.init();
            `,
          }}
        />
      </>
    );
  }
}
