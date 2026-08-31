export interface Setting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  target: string;
  created_at: string;
  children?: NavigationItem[];
}

export interface Page {
  id: string;
  slug: string;
  lang: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image: string | null;
  content_html: string;
  page_sections: string[];
  city: string | null;
  is_city_page: boolean;
  is_published: boolean;
  sort_order: number;
  show_reviews: boolean;
  show_comments: boolean;
  layout_variant: string;
  created_at: string;
  updated_at: string;
}

export interface PageCustomPrice {
  id: string;
  page_id: string;
  category: string;
  label: string;
  price_from: number | null;
  price_to: number | null;
  unit: string;
  note: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  lang: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  featured_image: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  author: string;
  city: string | null;
  story_prompt: string | null;
  story_image_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PriceItem {
  id: string;
  category: string;
  label: string;
  price_from: number | null;
  price_to: number | null;
  unit: string;
  note: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AiConfig {
  id: string;
  name: string;
  provider: string;
  api_key: string;
  model: string;
  base_url: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarMake {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface CarModel {
  id: string;
  make_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface CarGeneration {
  id: string;
  model_id: string;
  name: string;
  code: string;
  years_start: number | null;
  years_end: number | null;
  sort_order: number;
  created_at: string;
}

export interface CarVariant {
  id: string;
  generation_id: string;
  name: string;
  engine_code: string | null;
  fuel_type: string | null;
  power_hp: number | null;
  sort_order: number;
  created_at: string;
}

export interface TireSpec {
  id: string;
  variant_id: string;
  position: 'front' | 'rear' | 'universal';
  width: number;
  aspect_ratio: number;
  rim_diameter: number;
  load_index: string | null;
  speed_index: string | null;
  tire_type: 'standard' | 'reinforced' | 'run_flat';
  notes: string | null;
  sort_order: number;
  created_at: string;
  is_xl?: boolean;
  is_c?: boolean;
  is_run_flat?: boolean;
  motor_source?: string | null;
  raw_size?: string | null;
}

export interface AcSpec {
  id: string;
  variant_id: string;
  refrigerant_type: string;
  refrigerant_amount_g: number | null;
  oil_type: string | null;
  oil_amount_ml: number | null;
  needs_manual_check: boolean;
  notes: string | null;
  created_at: string;
  refrigerant_amount_min_g?: number | null;
  refrigerant_amount_max_g?: number | null;
  oil_service?: string | null;
  source_model?: string | null;
  verification_status?: string | null;
  original_refrigerant?: string | null;
  ac_notes?: string | null;
}

export interface AcPricingSettings {
  id: string;
  refrigerant_r134a_price_per_gram: number;
  refrigerant_r1234yf_price_per_gram: number;
  labor_cost_car: number;
  labor_cost_van: number;
  is_active: boolean;
  updated_at: string;
}

export interface AcExtraService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  applies_to: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface TireShopConfig {
  id: string;
  name: string;
  url_template: string;
  is_enabled: boolean;
  open_in_new_tab: boolean;
  button_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TireSizeEntry {
  id: string;
  width: number;
  aspect_ratio: number;
  rim_diameter: number;
  is_common: boolean;
  category: string;
  created_at: string;
}

export interface PageView {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  device_type: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface AiGenerationLog {
  id: string;
  config_id: string | null;
  config_name: string | null;
  type: string;
  topic: string | null;
  status: string;
  tokens_used: number | null;
  error_message: string | null;
  created_at: string;
}

export interface Popup {
  id: string;
  type: 'banner' | 'poll' | 'welcome' | 'announcement';
  title: string;
  content_html: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  poll_question: string | null;
  poll_options: string[];
  poll_votes: Record<string, number>;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  display_frequency: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  is_visible: boolean;
  sort_order: number;
  custom_title: string | null;
  custom_subtitle: string | null;
  custom_image: string | null;
  custom_video: string | null;
  custom_html: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  service: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PageBlock {
  id: string;
  parent_type: 'page' | 'blog';
  parent_id: string;
  block_type: string;
  block_data: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  link_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Lottery {
  id: string;
  title: string;
  description_html: string | null;
  prize: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  winner_name: string | null;
  created_at: string;
}

export interface LotteryEntry {
  id: string;
  lottery_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface AnnouncementBanner {
  id: string;
  text: string;
  link_url: string | null;
  bg_color: string;
  text_color: string;
  animation: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  phone: string;
  phone_2: string;
  email: string;
  address: string;
  working_hours: string;
  footer_copyright: string;
  google_analytics: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  admin_password: string;
  custom_cursor_enabled?: string;
  animations_enabled?: string;
  og_default_image?: string;
  lottery_enabled?: string;
  towing_partner_name?: string;
  towing_partner_url?: string;
  towing_partner_logo?: string;
  logo_url?: string;
  favicon_url?: string;
  android_app_url?: string;
  calc_discount_enabled?: string;
  calc_discount_threshold?: string;
  calc_discount_percent?: string;
  [key: string]: string | undefined;
}
