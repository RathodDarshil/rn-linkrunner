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

export type Response = {
  ip_location_data: LRIPLocationData;
  deeplink: string;
  root_domain: boolean;
  trigger?: boolean;
};
