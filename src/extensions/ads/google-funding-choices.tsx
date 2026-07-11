import { ReactNode } from 'react';

import { AdsConfigs, AdsProvider } from '@/extensions/ads';

export interface GoogleFundingChoicesConfigs extends AdsConfigs {
  publisherId: string;
}

function getFundingChoicesScriptSrc(value: string) {
  const normalized = value.trim();
  if (!normalized) return '';

  if (normalized.startsWith('https://')) {
    return normalized;
  }

  const publisherId = normalized.startsWith('ca-pub-')
    ? normalized.replace(/^ca-/, '')
    : normalized;

  return `https://fundingchoicesmessages.google.com/i/${publisherId}?ers=1`;
}

export class GoogleFundingChoicesProvider implements AdsProvider {
  readonly name = 'google-funding-choices';

  configs: GoogleFundingChoicesConfigs;

  constructor(configs: GoogleFundingChoicesConfigs) {
    this.configs = configs;
  }

  getHeadScripts(): ReactNode {
    const src = getFundingChoicesScriptSrc(this.configs.publisherId);
    if (!src) return null;

    return (
      <>
        <script async src={src}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function signalGooglefcPresent() {
                  if (!window.frames['googlefcPresent']) {
                    if (document.body) {
                      const iframe = document.createElement('iframe');
                      iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
                      iframe.style.display = 'none';
                      iframe.name = 'googlefcPresent';
                      document.body.appendChild(iframe);
                    } else {
                      setTimeout(signalGooglefcPresent, 0);
                    }
                  }
                }
                signalGooglefcPresent();
              })();
            `,
          }}
        />
      </>
    );
  }

  getBodyScripts(): ReactNode {
    return null;
  }

  getMetaTags(): ReactNode {
    return null;
  }
}
