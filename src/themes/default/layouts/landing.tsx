import { type ReactNode } from 'react';

import { DEFAULT_HEADER_POSITION, type HeaderPosition } from '@/config/layout';

import { LuseePublicShell } from '@/components/layouts/public/lusee-public-shell';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/types/blocks/landing';

export default function LandingLayout({
  children,
  header: _header,
  footer,
  headerPosition: _headerPosition = DEFAULT_HEADER_POSITION,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
  headerPosition?: HeaderPosition;
}) {
  return <LuseePublicShell footer={footer}>{children}</LuseePublicShell>;
}
