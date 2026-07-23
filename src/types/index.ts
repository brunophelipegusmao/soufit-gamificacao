export type Campaign = {
  id: string;
  slug: string;
  title: string;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  contract_starts_at: string;
  contract_ends_at: string;
  event_starts_at: string | null;
  event_ends_at: string | null;
  active: boolean;
};

export type CampaignExtensionRequest = {
  id: string;
  campaign_id: string;
  requested_by: string;
  requested_until: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export type User = {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  created_at: string;
};

export type CampaignParticipant = {
  id: string;
  campaign_id: string;
  user_id: string;
  venue_id: string;
  lgpd_consent: boolean;
  created_at: string;
};

export type Mission = {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  xp_value: number;
  validation_type: "qr" | "manual" | "auto";
  repeatable: boolean;
  max_per_day: number;
  active: boolean;
};

export type XpLog = {
  id: string;
  user_id: string;
  mission_id: string;
  points: number;
  created_at: string;
};

export type RankingEntry = {
  user_id: string;
  name: string;
  venue_name: string;
  total_xp: number;
  total_actions: number;
  position: number;
};

export type CampaignVenue = {
  campaign_id: string;
  venue_id: string;
};

export type QrCode = {
  id: string;
  campaign_id: string;
  venue_id: string;
  mission_id: string;
  token: string;
  label: string;
  created_at: string;
};

export type Superadmin = {
  user_id: string;
  created_at: string;
};

export type CampaignAdmin = {
  id: string;
  campaign_id: string;
  user_id: string;
  is_principal: boolean;
  created_at: string;
};
