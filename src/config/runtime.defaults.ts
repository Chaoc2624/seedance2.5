import { DEFAULT_IMAGE_MODEL_CATALOG_JSON } from '@/config/ai-models';

/**
 * Runtime configuration defaults.
 *
 * These are the code-level defaults for all runtime settings.
 * Priority chain: process.env > these defaults > DB config table (full mode only).
 *
 * In 'lite' preset, the DB config table is not used, so these defaults + env vars
 * are the only runtime source of truth. The local dev config panel can write env
 * files for no-db projects, but production still uses deploy-time env.
 */

export const defaults: Record<string, string> = {
  // ─── auth ───
  email_auth_enabled: 'true',
  email_verification_enabled: 'false',
  google_auth_enabled: 'false',
  google_one_tap_enabled: 'false',
  google_client_id: '',
  google_client_secret: '',
  github_auth_enabled: 'false',
  github_client_id: '',
  github_client_secret: '',

  // ─── app info ───
  app_name: '',
  app_description: '',
  app_logo: '',
  app_preview_image: '',

  // ─── layout ───
  layout_header_position: 'top',

  // ─── user defaults ───
  initial_role_enabled: 'false',
  initial_role_name: 'viewer',
  initial_credits_enabled: 'false',
  initial_credits_amount: '0',
  initial_credits_valid_days: '30',
  initial_credits_description: '',
  daily_credits_enabled: 'true',
  daily_credits_amount: '10',
  daily_credits_valid_days: '1',
  daily_credits_description: 'daily free credits',
  daily_credits_blocked_countries: 'IN',
  pro_feature_plan_names: 'Pro,Studio',

  // ─── payment ───
  select_payment_enabled: 'false',
  pay_as_you_go_enabled: 'true',
  default_payment_provider: 'stripe',
  stripe_enabled: 'false',
  stripe_publishable_key: '',
  stripe_secret_key: '',
  stripe_signing_secret: '',
  stripe_payment_methods: 'card',
  stripe_promotion_codes: '',
  stripe_allow_promotion_codes: 'false',
  creem_enabled: 'false',
  creem_environment: 'sandbox',
  creem_api_key: '',
  creem_signing_secret: '',
  creem_product_ids: '',
  paypal_enabled: 'false',
  paypal_environment: 'sandbox',
  paypal_client_id: '',
  paypal_client_secret: '',
  paypal_webhook_id: '',

  // ─── analytics ───
  google_analytics_id: '',
  google_search_console_id: '',
  clarity_id: '',
  plausible_script_id: '',
  bing_webmaster_verification_id: '',
  bing_indexnow_key: '',

  // ─── email ───
  resend_api_key: '',
  resend_sender_email: '',

  // ─── storage ───
  r2_access_key: '',
  r2_secret_key: '',
  r2_bucket_name: '',
  r2_upload_path: 'uploads',
  r2_endpoint: '',
  r2_domain: '',

  // ─── ai ───
  openrouter_api_key: '',
  openrouter_base_url: '',
  replicate_api_token: '',
  replicate_custom_storage: 'false',
  fal_api_key: '',
  fal_custom_storage: 'false',
  gemini_api_key: '',
  kie_api_key: '',
  kie_custom_storage: 'false',
  ai_image_model_catalog: DEFAULT_IMAGE_MODEL_CATALOG_JSON,

  // ─── ads ───
  adsense_code: '',
  google_funding_choices_id: '',

  // ─── affiliate ───
  affonso_enabled: 'false',
  affonso_id: '',
  affonso_cookie_duration: '30',
  promotekit_enabled: 'false',
  promotekit_id: '',
};
