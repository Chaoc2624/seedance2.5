import { DEFAULT_IMAGE_MODEL_CATALOG_JSON } from '@/config/ai-models';
import defaultPricingMessages from '@/config/locale/en/pages/pricing.json';

import { Tab } from '@/types/blocks/common';

export interface Setting {
  name: string;
  title: string;
  type: string;
  placeholder?: string;
  options?: {
    title: string;
    value: string;
  }[];
  tip?: string;
  value?: string | string[] | boolean | number;
  group?: string;
  tab?: string;
  attributes?: Record<string, any>;
  metadata?: Record<string, unknown>;
}

export interface SettingGroup {
  name: string;
  title: string;
  description?: string;
  tab: string;
}

function getDefaultPricingProductIds() {
  const items =
    defaultPricingMessages.page?.sections?.pricing?.items?.map(
      (item) => item.product_id
    ) ?? [];

  return Array.from(new Set(items.filter(Boolean)));
}

function getCreemProductIdsPlaceholder() {
  const productIds = getDefaultPricingProductIds();

  if (productIds.length === 0) {
    return '{}';
  }

  return JSON.stringify(
    Object.fromEntries(productIds.map((productId) => [productId, 'prod_xxx'])),
    null,
    2
  );
}

export function getSettingTabs(tab: string) {
  const tabs: Tab[] = [
    {
      name: 'general',
      title: 'edit.tabs.general',
      url: '/shiponce/settings/general',
      is_active: tab === 'general',
    },
    {
      name: 'auth',
      title: 'edit.tabs.auth',
      url: '/shiponce/settings/auth',
      is_active: tab === 'auth',
    },
    {
      name: 'payment',
      title: 'edit.tabs.payment',
      url: '/shiponce/settings/payment',
      is_active: tab === 'payment',
    },
    {
      name: 'email',
      title: 'edit.tabs.email',
      url: '/shiponce/settings/email',
      is_active: tab === 'email',
    },
    {
      name: 'storage',
      title: 'edit.tabs.storage',
      url: '/shiponce/settings/storage',
      is_active: tab === 'storage',
    },

    {
      name: 'ai',
      title: 'edit.tabs.ai',
      url: '/shiponce/settings/ai',
      is_active: tab === 'ai',
    },
    {
      name: 'analytics',
      title: 'edit.tabs.analytics',
      url: '/shiponce/settings/analytics',
      is_active: tab === 'analytics',
    },
    {
      name: 'ads',
      title: 'edit.tabs.ads',
      url: '/shiponce/settings/ads',
      is_active: tab === 'ads',
    },
    {
      name: 'affiliate',
      title: 'edit.tabs.affiliate',
      url: '/shiponce/settings/affiliate',
      is_active: tab === 'affiliate',
    },
  ];

  return tabs;
}

export function getSettingGroups() {
  const settingGroups: SettingGroup[] = [
    {
      name: 'appinfo',
      title: 'groups.appinfo',
      description: 'descriptions.appinfo',
      tab: 'general',
    },
    {
      name: 'user_role',
      title: 'groups.user_role',
      description: 'descriptions.user_role',
      tab: 'general',
    },
    {
      name: 'credit',
      title: 'groups.credit',
      description: 'descriptions.credit',
      tab: 'general',
    },
    {
      name: 'ai_access',
      title: 'groups.ai_access',
      description: 'descriptions.ai_access',
      tab: 'ai',
    },
    {
      name: 'ai_model_catalog',
      title: 'groups.ai_model_catalog',
      description: 'descriptions.ai_model_catalog',
      tab: 'ai',
    },
    {
      name: 'email_auth',
      title: 'groups.email_auth',
      description: 'descriptions.email_auth',
      tab: 'auth',
    },
    {
      name: 'google_auth',
      title: 'groups.google_auth',
      description: 'descriptions.google_auth',
      tab: 'auth',
    },
    {
      name: 'github_auth',
      title: 'groups.github_auth',
      description: 'descriptions.github_auth',
      tab: 'auth',
    },
    {
      name: 'basic_payment',
      title: 'groups.basic_payment',
      description: 'descriptions.basic_payment',
      tab: 'payment',
    },
    {
      name: 'stripe',
      title: 'groups.stripe',
      description: 'descriptions.stripe',
      tab: 'payment',
    },
    {
      name: 'creem',
      title: 'groups.creem',
      description: 'descriptions.creem',
      tab: 'payment',
    },
    {
      name: 'paypal',
      title: 'groups.paypal',
      description: 'descriptions.paypal',
      tab: 'payment',
    },
    {
      name: 'google_analytics',
      title: 'groups.google_analytics',
      description: 'descriptions.google_analytics',
      tab: 'analytics',
    },
    {
      name: 'clarity',
      title: 'groups.clarity',
      description: 'descriptions.clarity',
      tab: 'analytics',
    },
    {
      name: 'plausible',
      title: 'groups.plausible',
      description: 'descriptions.plausible',
      tab: 'analytics',
    },
    {
      name: 'bing_webmaster',
      title: 'groups.bing_webmaster',
      description: 'descriptions.bing_webmaster',
      tab: 'analytics',
    },
    {
      name: 'resend',
      title: 'groups.resend',
      description: 'descriptions.resend',
      tab: 'email',
    },
    {
      name: 'r2',
      title: 'groups.r2',
      description: 'descriptions.r2',
      tab: 'storage',
    },
    {
      name: 'openrouter',
      title: 'groups.openrouter',
      description: 'descriptions.openrouter',
      tab: 'ai',
    },
    {
      name: 'replicate',
      title: 'groups.replicate',
      description: 'descriptions.replicate',
      tab: 'ai',
    },
    {
      name: 'fal',
      title: 'groups.fal',
      description: 'descriptions.fal',
      tab: 'ai',
    },
    {
      name: 'gemini',
      title: 'groups.gemini',
      description: 'descriptions.gemini',
      tab: 'ai',
    },
    {
      name: 'kie',
      title: 'groups.kie',
      description: 'descriptions.kie',
      tab: 'ai',
    },
    {
      name: 'adsense',
      title: 'groups.adsense',
      description: 'descriptions.adsense',
      tab: 'ads',
    },
    {
      name: 'google_funding_choices',
      title: 'groups.google_funding_choices',
      description: 'descriptions.google_funding_choices',
      tab: 'ads',
    },
    {
      name: 'affonso',
      title: 'groups.affonso',
      description: 'descriptions.affonso',
      tab: 'affiliate',
    },
    {
      name: 'promotekit',
      title: 'groups.promotekit',
      description: 'descriptions.promotekit',
      tab: 'affiliate',
    },
  ];
  return settingGroups;
}

export function getSettingGroupsByTab(tab: string) {
  return getSettingGroups().filter((group) => group.tab === tab);
}

export async function getSettings() {
  const settings: Setting[] = [
    {
      name: 'app_name',
      title: 'settings.app_name.title',
      placeholder: 'Seedance 2.5',
      type: 'text',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'app_description',
      title: 'settings.app_description.title',
      placeholder: 'settings.app_description.placeholder',
      type: 'textarea',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'app_logo',
      title: 'settings.app_logo.title',
      type: 'upload_image',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'app_preview_image',
      title: 'settings.app_preview_image.title',
      type: 'upload_image',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'initial_role_enabled',
      title: 'settings.initial_role_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'user_role',
      tab: 'general',
      tip: 'settings.initial_role_enabled.tip',
    },
    {
      name: 'initial_role_name',
      title: 'settings.initial_role_name.title',
      type: 'select',
      value: 'viewer',
      options: [
        { title: 'settings.initial_role_name.options.viewer', value: 'viewer' },
        { title: 'settings.initial_role_name.options.editor', value: 'editor' },
        { title: 'settings.initial_role_name.options.admin', value: 'admin' },
        {
          title: 'settings.initial_role_name.options.super_admin',
          value: 'super_admin',
        },
      ],
      group: 'user_role',
      tab: 'general',
      tip: 'settings.initial_role_name.tip',
    },
    {
      name: 'initial_credits_enabled',
      title: 'settings.initial_credits_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'credit',
      tab: 'general',
      tip: 'settings.initial_credits_enabled.tip',
    },
    {
      name: 'initial_credits_amount',
      title: 'settings.initial_credits_amount.title',
      type: 'number',
      placeholder: '0',
      group: 'credit',
      tab: 'general',
      tip: 'settings.initial_credits_amount.tip',
    },
    {
      name: 'initial_credits_valid_days',
      title: 'settings.initial_credits_valid_days.title',
      type: 'number',
      placeholder: '30',
      group: 'credit',
      tab: 'general',
      tip: 'settings.initial_credits_valid_days.tip',
    },
    {
      name: 'initial_credits_description',
      title: 'settings.initial_credits_description.title',
      type: 'text',
      placeholder: 'settings.initial_credits_description.placeholder',
      group: 'credit',
      tab: 'general',
      tip: 'settings.initial_credits_description.tip',
    },
    {
      name: 'daily_credits_enabled',
      title: 'settings.daily_credits_enabled.title',
      type: 'switch',
      value: 'true',
      group: 'credit',
      tab: 'general',
      tip: 'settings.daily_credits_enabled.tip',
    },
    {
      name: 'daily_credits_amount',
      title: 'settings.daily_credits_amount.title',
      type: 'number',
      placeholder: '10',
      group: 'credit',
      tab: 'general',
      tip: 'settings.daily_credits_amount.tip',
    },
    {
      name: 'daily_credits_valid_days',
      title: 'settings.daily_credits_valid_days.title',
      type: 'number',
      placeholder: '1',
      group: 'credit',
      tab: 'general',
      tip: 'settings.daily_credits_valid_days.tip',
    },
    {
      name: 'daily_credits_description',
      title: 'settings.daily_credits_description.title',
      type: 'text',
      placeholder: 'settings.daily_credits_description.placeholder',
      group: 'credit',
      tab: 'general',
      tip: 'settings.daily_credits_description.tip',
    },
    {
      name: 'daily_credits_blocked_countries',
      title: 'settings.daily_credits_blocked_countries.title',
      type: 'text',
      placeholder: 'IN',
      group: 'credit',
      tab: 'general',
      tip: 'settings.daily_credits_blocked_countries.tip',
    },
    {
      name: 'email_auth_enabled',
      title: 'settings.email_auth_enabled.title',
      type: 'switch',
      value: 'true',
      group: 'email_auth',
      tab: 'auth',
    },
    {
      name: 'email_verification_enabled',
      title: 'settings.email_verification_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'email_auth',
      tab: 'auth',
      tip: 'settings.email_verification_enabled.tip',
    },
    {
      name: 'google_auth_enabled',
      title: 'settings.google_auth_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'google_one_tap_enabled',
      title: 'settings.google_one_tap_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'google_client_id',
      title: 'settings.google_client_id.title',
      type: 'text',
      placeholder: '',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'google_client_secret',
      title: 'settings.google_client_secret.title',
      type: 'password',
      placeholder: '',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'github_auth_enabled',
      title: 'settings.github_auth_enabled.title',
      type: 'switch',
      group: 'github_auth',
      tab: 'auth',
    },
    {
      name: 'github_client_id',
      title: 'settings.github_client_id.title',
      type: 'text',
      placeholder: '',
      group: 'github_auth',
      tab: 'auth',
    },
    {
      name: 'github_client_secret',
      title: 'settings.github_client_secret.title',
      type: 'password',
      placeholder: '',
      group: 'github_auth',
      tab: 'auth',
    },
    {
      name: 'select_payment_enabled',
      title: 'settings.select_payment_enabled.title',
      type: 'switch',
      value: 'false',
      tip: 'settings.select_payment_enabled.tip',
      placeholder: '',
      group: 'basic_payment',
      tab: 'payment',
    },
    {
      name: 'pay_as_you_go_enabled',
      title: 'settings.pay_as_you_go_enabled.title',
      type: 'switch',
      value: 'true',
      tip: 'settings.pay_as_you_go_enabled.tip',
      group: 'basic_payment',
      tab: 'payment',
    },
    {
      name: 'default_payment_provider',
      title: 'settings.default_payment_provider.title',
      type: 'select',
      value: 'stripe',
      options: [
        {
          title: 'Stripe',
          value: 'stripe',
        },
        {
          title: 'Creem',
          value: 'creem',
        },
        {
          title: 'Paypal',
          value: 'paypal',
        },
      ],
      tip: 'settings.default_payment_provider.tip',
      group: 'basic_payment',
      tab: 'payment',
    },
    {
      name: 'stripe_enabled',
      title: 'settings.stripe_enabled.title',
      type: 'switch',
      value: 'false',
      placeholder: '',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_publishable_key',
      title: 'settings.stripe_publishable_key.title',
      type: 'text',
      placeholder: 'pk_xxx',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_secret_key',
      title: 'settings.stripe_secret_key.title',
      type: 'password',
      placeholder: 'sk_xxx',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_signing_secret',
      title: 'settings.stripe_signing_secret.title',
      type: 'password',
      placeholder: 'whsec_xxx',
      tip: 'settings.stripe_signing_secret.tip',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_payment_methods',
      title: 'settings.stripe_payment_methods.title',
      type: 'checkbox',
      tip: 'settings.stripe_payment_methods.tip',
      options: [
        {
          title: 'settings.stripe_payment_methods.options.card',
          value: 'card',
        },
        {
          title: 'settings.stripe_payment_methods.options.wechat_pay',
          value: 'wechat_pay',
        },
        {
          title: 'settings.stripe_payment_methods.options.alipay',
          value: 'alipay',
        },
      ],
      value: ['card'],
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_promotion_codes',
      title: 'settings.stripe_promotion_codes.title',
      type: 'textarea',
      attributes: {
        rows: 6,
      },
      placeholder: `{
  "starter": "promo_xxx",
  "standard-monthly": "promo_xxx",
  "premium-yearly": "promo_xxx"
}`,
      group: 'stripe',
      tab: 'payment',
      tip: 'settings.stripe_promotion_codes.tip',
    },
    {
      name: 'stripe_allow_promotion_codes',
      title: 'settings.stripe_allow_promotion_codes.title',
      type: 'switch',
      value: 'false',
      group: 'stripe',
      tab: 'payment',
      tip: 'settings.stripe_allow_promotion_codes.tip',
    },
    {
      name: 'creem_enabled',
      title: 'settings.creem_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'creem',
      tab: 'payment',
    },
    {
      name: 'creem_environment',
      title: 'settings.creem_environment.title',
      type: 'select',
      value: 'sandbox',
      options: [
        { title: 'settings.environment.options.sandbox', value: 'sandbox' },
        {
          title: 'settings.environment.options.production',
          value: 'production',
        },
      ],
      group: 'creem',
      tab: 'payment',
    },
    {
      name: 'creem_api_key',
      title: 'settings.creem_api_key.title',
      type: 'password',
      placeholder: 'creem_xxx',
      group: 'creem',
      tab: 'payment',
    },
    {
      name: 'creem_signing_secret',
      title: 'settings.creem_signing_secret.title',
      type: 'password',
      placeholder: 'whsec_xxx',
      group: 'creem',
      tab: 'payment',
      tip: 'settings.creem_signing_secret.tip',
    },
    {
      name: 'creem_product_ids',
      title: 'settings.creem_product_ids.title',
      type: 'textarea',
      attributes: {
        rows: 6,
      },
      placeholder: getCreemProductIdsPlaceholder(),
      group: 'creem',
      tab: 'payment',
      tip: 'settings.creem_product_ids.tip',
    },
    {
      name: 'paypal_enabled',
      title: 'settings.paypal_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_environment',
      title: 'settings.paypal_environment.title',
      type: 'select',
      value: 'sandbox',
      options: [
        { title: 'settings.environment.options.sandbox', value: 'sandbox' },
        {
          title: 'settings.environment.options.production',
          value: 'production',
        },
      ],
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_client_id',
      title: 'settings.paypal_client_id.title',
      type: 'text',
      placeholder: 'paypal_xxx',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_client_secret',
      title: 'settings.paypal_client_secret.title',
      type: 'password',
      placeholder: 'paypal_xxx',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_webhook_id',
      title: 'settings.paypal_webhook_id.title',
      type: 'text',
      placeholder: 'xxx',
      tip: 'settings.paypal_webhook_id.tip',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'google_analytics_id',
      title: 'settings.google_analytics_id.title',
      type: 'text',
      placeholder: '',
      group: 'google_analytics',
      tab: 'analytics',
    },
    {
      name: 'google_search_console_id',
      title: 'settings.google_search_console_id.title',
      type: 'text',
      placeholder: '',
      group: 'google_analytics',
      tab: 'analytics',
    },
    {
      name: 'clarity_id',
      title: 'settings.clarity_id.title',
      type: 'text',
      placeholder: '',
      group: 'clarity',
      tab: 'analytics',
    },
    {
      name: 'plausible_script_id',
      title: 'settings.plausible_script_id.title',
      type: 'text',
      placeholder: 'pa-xxxxxxxxxxxxxxxx',
      tip: 'settings.plausible_script_id.tip',
      group: 'plausible',
      tab: 'analytics',
    },
    {
      name: 'bing_webmaster_verification_id',
      title: 'settings.bing_webmaster_verification_id.title',
      type: 'text',
      placeholder: '',
      group: 'bing_webmaster',
      tab: 'analytics',
    },
    {
      name: 'bing_indexnow_key',
      title: 'settings.bing_indexnow_key.title',
      type: 'text',
      placeholder: '142a3398041a443b8ededee3f65eeb05',
      tip: 'settings.bing_indexnow_key.tip',
      group: 'bing_webmaster',
      tab: 'analytics',
    },
    {
      name: 'resend_api_key',
      title: 'settings.resend_api_key.title',
      type: 'password',
      placeholder: '',
      group: 'resend',
      tab: 'email',
    },
    {
      name: 'resend_sender_email',
      title: 'settings.resend_sender_email.title',
      type: 'text',
      placeholder: 'Seedance 2.5 <no-reply@example.com>',
      group: 'resend',
      tab: 'email',
    },
    {
      name: 'r2_access_key',
      title: 'settings.r2_access_key.title',
      type: 'text',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_secret_key',
      title: 'settings.r2_secret_key.title',
      type: 'password',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_bucket_name',
      title: 'settings.r2_bucket_name.title',
      type: 'text',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_upload_path',
      title: 'settings.r2_upload_path.title',
      type: 'text',
      placeholder: 'uploads',
      tip: 'settings.r2_upload_path.tip',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_endpoint',
      title: 'settings.r2_endpoint.title',
      type: 'url',
      placeholder: 'https://<account-id>.r2.cloudflarestorage.com',
      tip: 'settings.r2_endpoint.tip',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_domain',
      title: 'settings.r2_domain.title',
      type: 'url',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'openrouter_api_key',
      title: 'settings.openrouter_api_key.title',
      type: 'password',
      placeholder: 'sk-or-xxx',
      group: 'openrouter',
      tab: 'ai',
    },
    {
      name: 'openrouter_base_url',
      title: 'settings.openrouter_base_url.title',
      type: 'url',
      placeholder: 'https://openrouter.ai/api/v1',
      tip: 'settings.openrouter_base_url.tip',
      group: 'openrouter',
      tab: 'ai',
    },
    {
      name: 'replicate_api_token',
      title: 'settings.replicate_api_token.title',
      type: 'password',
      placeholder: 'r8_xxx',
      group: 'replicate',
      tab: 'ai',
    },
    {
      name: 'replicate_custom_storage',
      title: 'settings.replicate_custom_storage.title',
      type: 'switch',
      value: 'false',
      group: 'replicate',
      tab: 'ai',
      tip: 'settings.replicate_custom_storage.tip',
    },
    {
      name: 'fal_api_key',
      title: 'settings.fal_api_key.title',
      type: 'password',
      placeholder: 'fal_xxx',
      group: 'fal',
      tip: 'settings.fal_api_key.tip',
      tab: 'ai',
    },
    {
      name: 'fal_custom_storage',
      title: 'settings.fal_custom_storage.title',
      type: 'switch',
      value: 'false',
      group: 'fal',
      tab: 'ai',
      tip: 'settings.fal_custom_storage.tip',
    },
    {
      name: 'gemini_api_key',
      title: 'settings.gemini_api_key.title',
      type: 'password',
      placeholder: 'AIza...',
      group: 'gemini',
      tip: 'settings.gemini_api_key.tip',
      tab: 'ai',
    },
    {
      name: 'kie_api_key',
      title: 'settings.kie_api_key.title',
      type: 'password',
      placeholder: 'xxx',
      group: 'kie',
      tip: 'settings.kie_api_key.tip',
      tab: 'ai',
    },
    {
      name: 'kie_custom_storage',
      title: 'settings.kie_custom_storage.title',
      type: 'switch',
      value: 'false',
      group: 'kie',
      tab: 'ai',
      tip: 'settings.kie_custom_storage.tip',
    },
    {
      name: 'pro_feature_plan_names',
      title: 'settings.pro_feature_plan_names.title',
      type: 'text',
      placeholder: 'Pro,Ultra',
      group: 'ai_access',
      tab: 'ai',
      tip: 'settings.pro_feature_plan_names.tip',
    },
    {
      name: 'ai_image_model_catalog',
      title: 'settings.ai_image_model_catalog.title',
      type: 'textarea',
      attributes: {
        rows: 18,
      },
      placeholder: DEFAULT_IMAGE_MODEL_CATALOG_JSON,
      group: 'ai_model_catalog',
      tab: 'ai',
      tip: 'settings.ai_image_model_catalog.tip',
    },
    {
      name: 'adsense_code',
      title: 'settings.adsense_code.title',
      type: 'text',
      placeholder: 'ca-pub-xxx',
      group: 'adsense',
      tab: 'ads',
    },
    {
      name: 'google_funding_choices_id',
      title: 'settings.google_funding_choices_id.title',
      type: 'text',
      placeholder: 'pub-xxx',
      group: 'google_funding_choices',
      tab: 'ads',
    },
    {
      name: 'affonso_enabled',
      title: 'settings.affonso_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'affonso',
      tab: 'affiliate',
    },
    {
      name: 'affonso_id',
      title: 'settings.affonso_id.title',
      type: 'text',
      placeholder: 'xxx',
      tip: 'settings.affonso_id.tip',
      group: 'affonso',
      tab: 'affiliate',
    },
    {
      name: 'affonso_cookie_duration',
      title: 'settings.affonso_cookie_duration.title',
      type: 'number',
      placeholder: '30',
      tip: 'settings.affonso_cookie_duration.tip',
      value: '30',
      group: 'affonso',
      tab: 'affiliate',
    },
    {
      name: 'promotekit_enabled',
      title: 'settings.promotekit_enabled.title',
      type: 'switch',
      value: 'false',
      group: 'promotekit',
      tab: 'affiliate',
    },
    {
      name: 'promotekit_id',
      title: 'settings.promotekit_id.title',
      type: 'text',
      placeholder: 'xxx',
      tip: 'settings.promotekit_id.tip',
      group: 'promotekit',
      tab: 'affiliate',
    },
  ];

  return settings;
}

export async function getSettingsByTab(tab: string) {
  const settings = await getSettings();
  return settings.filter((setting) => setting.tab === tab);
}

// SECURITY: this whitelist gates which DB-stored config keys are allowed to
// reach the browser via getPublicConfigs(). Only add keys that are safe to
// expose publicly, such as feature flags and public client IDs. Never add API
// keys, client secrets, signing secrets, or provider credentials here.
export const publicSettingNames = [
  'email_auth_enabled',
  'email_verification_enabled',
  'google_auth_enabled',
  'google_one_tap_enabled',
  'google_client_id',
  'github_auth_enabled',
  'select_payment_enabled',
  'default_payment_provider',
  'stripe_enabled',
  'creem_enabled',
  'paypal_enabled',
  'affonso_enabled',
  'promotekit_enabled',
];

export async function getAllSettingNames() {
  const settings = await getSettings();
  const settingNames: string[] = [];

  settings.forEach((setting: Setting) => {
    settingNames.push(setting.name);
  });

  return settingNames;
}
