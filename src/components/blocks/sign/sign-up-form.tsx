import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useState } from 'react';
import { toast } from 'sonner';

import { authClient, signUp } from '@/core/auth/client';
import { useLocale, useTranslations } from '@/core/i18n/hooks';
import { useRouter } from '@/core/i18n/navigation';

import { defaultLocale } from '@/config/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/hooks/use-app-context';
import { ensureDeviceFingerprint } from '@/lib/device-fingerprint';

import { SocialProviders } from './social-providers';

export function SignUpForm({
  callbackUrl = '/',
  className,
  onSwitchToSignIn,
}: {
  callbackUrl: string;
  className?: string;
  onSwitchToSignIn?: () => void;
}) {
  const t = useTranslations('common.sign');
  const router = useRouter();
  const locale = useLocale();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { configs, setIsShowSignModal, setUser, fetchUserInfo } =
    useAppContext();

  const isGoogleAuthEnabled = configs.google_auth_enabled === 'true';
  const isGithubAuthEnabled = configs.github_auth_enabled === 'true';
  const isEmailAuthEnabled =
    configs.email_auth_enabled !== 'false' ||
    (!isGoogleAuthEnabled && !isGithubAuthEnabled);
  const emailVerificationEnabled =
    configs.email_verification_enabled === 'true';

  if (callbackUrl) {
    if (
      locale !== defaultLocale &&
      callbackUrl.startsWith('/') &&
      !callbackUrl.startsWith(`/${locale}`)
    ) {
      callbackUrl = `/${locale}${callbackUrl}`;
    }
  }

  const base = locale !== defaultLocale ? `/${locale}` : '';
  const stripLocalePrefix = (path: string) => {
    if (!path?.startsWith('/')) return '/';
    if (locale === defaultLocale) return path;
    if (path === `/${locale}`) return '/';
    if (path.startsWith(`/${locale}/`))
      return path.slice(locale.length + 1) || '/';
    return path;
  };

  const reportAffiliate = ({
    userEmail,
    stripeCustomerId,
  }: {
    userEmail: string;
    stripeCustomerId?: string;
  }) => {
    if (typeof window === 'undefined' || !configs) {
      return;
    }

    const windowObject = window as any;

    if (configs.affonso_enabled === 'true' && windowObject.Affonso) {
      windowObject.Affonso.signup(userEmail);
    }

    if (configs.promotekit_enabled === 'true' && windowObject.promotekit) {
      windowObject.promotekit.refer(userEmail, stripeCustomerId);
    }
  };

  const handleSignUp = async () => {
    if (loading) {
      return;
    }

    if (!email || !password || !name) {
      toast.error('email, password and name are required');
      return;
    }

    setLoading(true);

    try {
      await ensureDeviceFingerprint();
      await signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onRequest: () => {},
          onResponse: () => {},
          onSuccess: (context: any) => {
            reportAffiliate({ userEmail: email });

            if (emailVerificationEnabled) {
              const normalizedCallbackUrl = stripLocalePrefix(callbackUrl);
              const verifyPath = `/verify-email?sent=1&email=${encodeURIComponent(
                email
              )}&callbackUrl=${encodeURIComponent(normalizedCallbackUrl)}`;

              void authClient.sendVerificationEmail({
                email,
                callbackURL: `${base}${normalizedCallbackUrl || '/'}`,
              });

              setIsShowSignModal(false);
              router.push(`${base}${verifyPath}`);
              return;
            }

            const freshUser = context?.data?.user ?? null;
            if (freshUser) {
              setUser(freshUser);
              void fetchUserInfo();
            }
            setIsShowSignModal(false);
            setLoading(false);
            router.refresh();
          },
          onError: (e: any) => {
            toast.error(e?.error?.message || 'sign up failed');
            setLoading(false);
          },
        }
      );
    } catch (e: any) {
      toast.error(e?.message || 'sign up failed');
      setLoading(false);
    }
  };

  return (
    <div className={`w-full text-slate-900 md:max-w-md ${className}`}>
      <div className="grid gap-4">
        {isEmailAuthEnabled && (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSignUp();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="signup-name" className="text-slate-700">
                {t('name_title')}
              </Label>
              <Input
                id="signup-name"
                type="text"
                placeholder={t('name_placeholder')}
                required
                className="border-blue-100 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="signup-email" className="text-slate-700">
                {t('email_title')}
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder={t('email_placeholder')}
                required
                className="border-blue-100 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
              {emailVerificationEnabled && (
                <p className="text-xs text-amber-600">
                  {t('email_verification_hint')}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="signup-password" className="text-slate-700">
                {t('password_title')}
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder={t('password_placeholder')}
                autoComplete="password"
                value={password}
                className="border-blue-100 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.18)] hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <p>{t('sign_up_title')}</p>
              )}
            </Button>
          </form>
        )}

        <SocialProviders
          configs={configs}
          callbackUrl={callbackUrl || '/'}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
      {isEmailAuthEnabled && (
        <div className="flex w-full justify-center border-t border-blue-100 py-4">
          <p className="text-center text-xs text-slate-500">
            {t('already_have_account')}
            <span
              className="cursor-pointer text-blue-600 underline"
              onClick={onSwitchToSignIn}
            >
              {t('sign_in_title')}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
