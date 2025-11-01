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
  id: string;
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
}

export interface AttributionData {
  // Direct fields
  deeplink?: string;
  campaignData?: CampaignData;
}