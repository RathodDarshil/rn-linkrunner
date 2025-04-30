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

export enum TokenType {
  FCM = 'FCM',
  APN = 'APN',
}

export interface PushTokenInfo {
  token: string;
  token_type: TokenType; // 'FCM' | 'APN'
}

export interface InitializationRequest {
  token: string;
  package_version: string;
  app_version: string;
  device_data: any; // You might want to create a more specific type for device_data
  platform: 'REACT_NATIVE';
  source: 'GENERAL' | 'ADS';
  link?: string;
  install_instance_id: string;
  push_token?: string;
  push_token_type?: TokenType;
}