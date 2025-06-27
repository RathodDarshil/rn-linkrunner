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
  mixpanel_distinct_id?: string;
  amplitude_device_id?: string;
  posthog_distinct_id?: string;
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