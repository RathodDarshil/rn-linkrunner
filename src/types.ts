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
  user_created_at?: Date;
  is_first_time_user?: boolean;
}

export interface TriggerConfig {
  trigger_deeplink?: boolean;
}

export interface CampaignData {
  id: string;
  name: string;
  type: 'ORGANIC' | 'INORGANIC';
  ad_network: 'META' | 'GOOGLE' | null;
  group_name: string | null;
  asset_group_name: string | null;
  asset_name: string | null;
}

export type Response = {
  ip_location_data: LRIPLocationData;
  deeplink: string;
  root_domain: boolean;
  trigger?: boolean;
  campaign_data: CampaignData;
};

export interface PushTokenInfo {
  fcm_push_token: string;
  apns_push_token?: string;
  platform_os: 'android' | 'ios';
}

export interface InitializationRequest {
  token: string;
  package_version: string;
  app_version: string;
  // specific device data interface can be created
  device_data: any;
  platform: 'REACT_NATIVE';
  source: 'GENERAL' | 'ADS';
  link?: string;
  install_instance_id: string;
  fcm_push_token?: string;
  apns_push_token?: string;
  platform_os?: 'android' | 'ios';
}