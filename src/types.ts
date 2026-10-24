export interface LRIPLocationData {
  ip: string;
  city: string;
  countryLong: string;
  countryShort: string;
  latitude: number;
  longitude: number;
  region: string;
  timeZone: string;
  zipCode: string;
}

export interface UserData {
  /**
   * Your customer user id. Required for `signup`; optional for `setUserData`, so
   * `setUserData` can be called right after `init` with only analytics ids.
   */
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  user_created_at?: string;
  is_first_time_user?: boolean;
  mixpanel_distinct_id?: string;
  amplitude_device_id?: string;
  posthog_distinct_id?: string;
  braze_device_id?: string;
  ga_app_instance_id?: string;
  ga_session_id?: string;
  netcore_device_guid?: string;
  moengage_user_id?: string;
}

export interface IntegrationData {
  clevertapId?: string;
}

export interface CampaignData {
  id: string;
  name: string;
  type: string;
  adNetwork?: string | null;
  installedAt: string;
  storeClickAt?: string | null;
  groupName?: string;
  assetName?: string;
  assetGroupName?: string;
  adNetworkCampaignId?: string | null;
  adSetId?: string | null;
  adSetName?: string | null;
  adCreativeId?: string | null;
  adCreativeName?: string | null;
}

export interface AttributionData {
  // Direct fields
  deeplink?: string;
  campaignData?: CampaignData;
  /** Android only. */
  gaid?: string | null;
  /** iOS only, null when ATT is not authorized. */
  idfa?: string | null;
}

export interface DeeplinkData {
  deeplink?: string;
  isLinkrunner: boolean;
  processing?: boolean;
}

/**
 * Tri-state consent signal for Google Ads.
 *
 * A string rather than a boolean because 'unknown' is a distinct state: it is omitted
 * from the payload rather than sent as a denial, so the backend can tell "we were never
 * told" apart from "the user said no". Never map 'unknown' to 'granted'.
 */
export type ConsentStatus = 'granted' | 'denied' | 'unknown';

/**
 * Google Ads consent state, normally sourced from your Consent Management Platform.
 * Anything omitted defaults to 'unknown'.
 */
export interface LinkrunnerConsent {
  /** Whether European regulations apply to this user (the EEA, the UK, or Switzerland). Sent as `is_eea`. */
  isEEA?: ConsentStatus;
  /** Whether the user consented to their data being sent to Google for advertising purposes. Sent as `ad_user_data`. */
  hasConsentForDataUsage?: ConsentStatus;
  /** Whether the user consented to their data being used to personalize ads. Sent as `ad_personalization`. */
  hasConsentForAdsPersonalization?: ConsentStatus;
}

/** Payment statuses; only PAYMENT_COMPLETED payments count as revenue and reach ad networks. */
export const PaymentStatus = {
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
