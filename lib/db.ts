import { supabase } from './supabase';
import type {
  SiteSettings,
  NavigationItem,
  Page,
  BlogPost,
  Testimonial,
  FaqItem,
  PriceItem,
  Service,
  AiConfig,
  Setting,
  PageCustomPrice,
  ContactSubmission,
  AcPricingSettings,
  AcExtraService,
  TireShopConfig,
  TireSizeEntry,
  Popup,
  HomepageSection,
  PageBlock,
  Partner,
  Lottery,
  LotteryEntry,
  AnnouncementBanner,
} from './types';
import {
  FALLBACK_SETTINGS,
  FALLBACK_NAVIGATION,
  FALLBACK_SERVICES,
  FALLBACK_PRICES,
  FALLBACK_TESTIMONIALS,
  FALLBACK_FAQ,
  FALLBACK_BLOG_POSTS,
  FALLBACK_PAGES,
} from './fallback-data';

// ─── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    const map: Record<string, string> = {};
    (data as Setting[]).forEach((s) => { if (s.value !== null) map[s.key] = s.value; });
    return { ...FALLBACK_SETTINGS, ...map } as SiteSettings;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

export async function upsertSettings(entries: Record<string, string>): Promise<void> {
  const rows = Object.entries(entries).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  await supabase.from('settings').upsert(rows, { onConflict: 'key' });
}

// ─── Navigation ────────────────────────────────────────────────────────────────

export async function getNavigation(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return buildNavTree(data as NavigationItem[]);
  } catch {
    return FALLBACK_NAVIGATION;
  }
}

function buildNavTree(items: NavigationItem[]): NavigationItem[] {
  const map = new Map<string, NavigationItem>();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));
  const roots: NavigationItem[] = [];
  map.forEach((item) => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.children!.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}

export async function getAllNavigationItems(): Promise<NavigationItem[]> {
  try {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data as NavigationItem[];
  } catch {
    return [];
  }
}

export async function createNavigationItem(item: Omit<NavigationItem, 'id' | 'created_at' | 'children'>): Promise<NavigationItem | null> {
  const { data, error } = await supabase.from('navigation_items').insert(item).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function updateNavigationItem(id: string, item: Partial<NavigationItem>): Promise<void> {
  await supabase.from('navigation_items').update(item).eq('id', id);
}

export async function deleteNavigationItem(id: string): Promise<void> {
  await supabase.from('navigation_items').delete().eq('id', id);
}

// ─── Pages ─────────────────────────────────────────────────────────────────────

export async function getAllPages(): Promise<Page[]> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data as Page[];
  } catch {
    return FALLBACK_PAGES;
  }
}

export async function getPublishedPages(lang?: string): Promise<Page[]> {
  try {
    let query = supabase.from('pages').select('*').eq('is_published', true).order('sort_order');
    if (lang) query = query.eq('lang', lang);
    const { data, error } = await query;
    if (error) throw error;
    return data as Page[];
  } catch {
    return FALLBACK_PAGES.filter((p) => p.is_published);
  }
}

export async function getPageBySlug(slug: string, lang?: string): Promise<Page | null> {
  try {
    let query = supabase.from('pages').select('*').eq('slug', slug);
    if (lang) query = query.eq('lang', lang);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data as Page | null;
  } catch {
    return FALLBACK_PAGES.find((p) => p.slug === slug) ?? null;
  }
}

export async function getPageById(id: string): Promise<Page | null> {
  const { data } = await supabase.from('pages').select('*').eq('id', id).maybeSingle();
  return data as Page | null;
}

export async function createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .insert({ ...page, updated_at: new Date().toISOString() })
    .select()
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function updatePage(id: string, page: Partial<Page>): Promise<void> {
  await supabase
    .from('pages')
    .update({ ...page, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function deletePage(id: string): Promise<void> {
  await supabase.from('pages').delete().eq('id', id);
}

// ─── Blog Posts ────────────────────────────────────────────────────────────────

export async function getPublishedBlogPosts(lang?: string): Promise<BlogPost[]> {
  try {
    let query = supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false });
    if (lang) query = query.eq('lang', lang);
    const { data, error } = await query;
    if (error) throw error;
    return data as BlogPost[];
  } catch {
    return FALLBACK_BLOG_POSTS;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data as BlogPost[];
  } catch {
    return FALLBACK_BLOG_POSTS;
  }
}

export async function getBlogPostBySlug(slug: string, lang?: string): Promise<BlogPost | null> {
  try {
    let query = supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true);
    if (lang) query = query.eq('lang', lang);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data as BlogPost | null;
  } catch {
    return FALLBACK_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  return data as BlogPost | null;
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({ ...post, updated_at: new Date().toISOString() })
    .select()
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<void> {
  await supabase
    .from('blog_posts')
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await supabase.from('blog_posts').delete().eq('id', id);
}

// ─── Testimonials ──────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return data as Testimonial[];
  } catch {
    return FALLBACK_TESTIMONIALS;
  }
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { data } = await supabase.from('testimonials').select('*').order('sort_order');
  return (data as Testimonial[]) ?? FALLBACK_TESTIMONIALS;
}

export async function upsertTestimonial(t: Partial<Testimonial> & { name: string; text: string }): Promise<void> {
  if (t.id) {
    await supabase.from('testimonials').update(t).eq('id', t.id);
  } else {
    await supabase.from('testimonials').insert(t);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  await supabase.from('testimonials').delete().eq('id', id);
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────

export async function getFaqItems(): Promise<FaqItem[]> {
  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return data as FaqItem[];
  } catch {
    return FALLBACK_FAQ;
  }
}

export async function getAllFaqItems(): Promise<FaqItem[]> {
  const { data } = await supabase.from('faq_items').select('*').order('sort_order');
  return (data as FaqItem[]) ?? FALLBACK_FAQ;
}

export async function upsertFaqItem(f: Partial<FaqItem> & { question: string; answer: string }): Promise<void> {
  if (f.id) {
    await supabase.from('faq_items').update(f).eq('id', f.id);
  } else {
    await supabase.from('faq_items').insert(f);
  }
}

export async function deleteFaqItem(id: string): Promise<void> {
  await supabase.from('faq_items').delete().eq('id', id);
}

// ─── Price Items ───────────────────────────────────────────────────────────────

export async function getPriceItems(): Promise<PriceItem[]> {
  try {
    const { data, error } = await supabase
      .from('price_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return data as PriceItem[];
  } catch {
    return FALLBACK_PRICES;
  }
}

export async function getAllPriceItems(): Promise<PriceItem[]> {
  const { data } = await supabase.from('price_items').select('*').order('sort_order');
  return (data as PriceItem[]) ?? FALLBACK_PRICES;
}

export async function upsertPriceItem(p: Partial<PriceItem> & { category: string; label: string }): Promise<void> {
  if (p.id) {
    await supabase.from('price_items').update(p).eq('id', p.id);
  } else {
    await supabase.from('price_items').insert(p);
  }
}

export async function deletePriceItem(id: string): Promise<void> {
  await supabase.from('price_items').delete().eq('id', id);
}

// ─── Services ──────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return data as Service[];
  } catch {
    return FALLBACK_SERVICES;
  }
}

export async function getAllServices(): Promise<Service[]> {
  const { data } = await supabase.from('services').select('*').order('sort_order');
  return (data as Service[]) ?? FALLBACK_SERVICES;
}

export async function upsertService(s: Partial<Service> & { title: string }): Promise<void> {
  if (s.id) {
    await supabase.from('services').update(s).eq('id', s.id);
  } else {
    await supabase.from('services').insert(s);
  }
}

export async function deleteService(id: string): Promise<void> {
  await supabase.from('services').delete().eq('id', id);
}

// ─── AI Configs ────────────────────────────────────────────────────────────────

export async function getAiConfigs(): Promise<AiConfig[]> {
  const { data } = await supabase
    .from('ai_configs')
    .select('*')
    .eq('is_active', true)
    .order('created_at');
  return (data as AiConfig[]) ?? [];
}

export async function getDefaultAiConfig(): Promise<AiConfig | null> {
  const { data } = await supabase
    .from('ai_configs')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .maybeSingle();
  return data as AiConfig | null;
}

export async function createAiConfig(config: Omit<AiConfig, 'id' | 'created_at' | 'updated_at'>): Promise<AiConfig | null> {
  const { data } = await supabase
    .from('ai_configs')
    .insert({ ...config, updated_at: new Date().toISOString() })
    .select()
    .maybeSingle();
  return data;
}

export async function updateAiConfig(id: string, config: Partial<AiConfig>): Promise<void> {
  await supabase
    .from('ai_configs')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function deleteAiConfig(id: string): Promise<void> {
  await supabase.from('ai_configs').delete().eq('id', id);
}

export async function setDefaultAiConfig(id: string): Promise<void> {
  await supabase.from('ai_configs').update({ is_default: false }).neq('id', id);
  await supabase.from('ai_configs').update({ is_default: true }).eq('id', id);
}

// ─── Page Custom Prices ────────────────────────────────────────────────────────

export async function getPageCustomPrices(pageId: string): Promise<PageCustomPrice[]> {
  const { data } = await supabase
    .from('page_custom_prices')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_active', true)
    .order('sort_order');
  return (data as PageCustomPrice[]) ?? [];
}

export async function upsertPageCustomPrice(p: Partial<PageCustomPrice> & { page_id: string; category: string; label: string }): Promise<void> {
  if (p.id) {
    await supabase.from('page_custom_prices').update(p).eq('id', p.id);
  } else {
    await supabase.from('page_custom_prices').insert(p);
  }
}

export async function deletePageCustomPrice(id: string): Promise<void> {
  await supabase.from('page_custom_prices').delete().eq('id', id);
}

export async function replacePageCustomPrices(pageId: string, prices: Omit<PageCustomPrice, 'id' | 'created_at'>[]): Promise<void> {
  await supabase.from('page_custom_prices').delete().eq('page_id', pageId);
  if (prices.length > 0) {
    await supabase.from('page_custom_prices').insert(prices);
  }
}

// ─── Contact Submissions ────────────────────────────────────────────────────────

export async function submitContactForm(data: {
  name: string;
  phone: string;
  email: string;
  message: string;
  service?: string;
  lang?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('contact_submissions').insert({
      ...data,
      created_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const { data } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  return (data as ContactSubmission[]) ?? [];
}

export async function markContactRead(id: string, isRead: boolean): Promise<void> {
  await supabase.from('contact_submissions').update({ is_read: isRead }).eq('id', id);
}

export async function deleteContactSubmission(id: string): Promise<void> {
  await supabase.from('contact_submissions').delete().eq('id', id);
}

// ─── AC Pricing ─────────────────────────────────────────────────────────────
export async function getAcPricingSettings(): Promise<AcPricingSettings | null> {
  const { data } = await supabase
    .from('ac_pricing_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();
  return data as AcPricingSettings | null;
}

export async function updateAcPricingSettings(updates: Partial<AcPricingSettings>): Promise<void> {
  await supabase
    .from('ac_pricing_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', 'default');
}

export async function getAcExtraServices(): Promise<AcExtraService[]> {
  const { data } = await supabase
    .from('ac_extra_services')
    .select('*')
    .order('sort_order');
  return (data as AcExtraService[]) ?? [];
}

export async function upsertAcExtraService(item: Partial<AcExtraService> & { name: string }): Promise<void> {
  if (item.id) {
    await supabase.from('ac_extra_services').update(item).eq('id', item.id);
  } else {
    await supabase.from('ac_extra_services').insert(item);
  }
}

export async function deleteAcExtraService(id: string): Promise<void> {
  await supabase.from('ac_extra_services').delete().eq('id', id);
}

// ─── Tire Shop Configs ──────────────────────────────────────────────────────
export async function getTireShopConfigs(): Promise<TireShopConfig[]> {
  const { data } = await supabase
    .from('tire_shop_configs')
    .select('*')
    .order('sort_order');
  return (data as TireShopConfig[]) ?? [];
}

export async function upsertTireShopConfig(item: Partial<TireShopConfig> & { name: string; url_template: string }): Promise<void> {
  if (item.id) {
    await supabase.from('tire_shop_configs').update({ ...item, updated_at: new Date().toISOString() }).eq('id', item.id);
  } else {
    await supabase.from('tire_shop_configs').insert(item);
  }
}

export async function deleteTireShopConfig(id: string): Promise<void> {
  await supabase.from('tire_shop_configs').delete().eq('id', id);
}

// ─── Tire Size Database ─────────────────────────────────────────────────────
export async function getTireSizeDatabase(): Promise<TireSizeEntry[]> {
  const { data } = await supabase
    .from('tire_size_database')
    .select('*')
    .order('width, aspect_ratio, rim_diameter');
  return (data as TireSizeEntry[]) ?? [];
}

export async function getEnabledTireShopConfigs(): Promise<TireShopConfig[]> {
  const { data } = await supabase
    .from('tire_shop_configs')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order');
  return (data as TireShopConfig[]) ?? [];
}

// ─── Popups ────────────────────────────────────────────────────────────────
export async function getActivePopups(): Promise<Popup[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('popups')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('sort_order');
  return (data as Popup[]) ?? [];
}

export async function getAllPopups(): Promise<Popup[]> {
  const { data } = await supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false });
  return (data as Popup[]) ?? [];
}

export async function createPopup(p: Partial<Popup>): Promise<void> {
  await supabase.from('popups').insert(p);
}

export async function updatePopup(id: string, p: Partial<Popup>): Promise<void> {
  await supabase.from('popups').update({ ...p, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deletePopup(id: string): Promise<void> {
  await supabase.from('popups').delete().eq('id', id);
}

// ─── Homepage Sections ──────────────────────────────────────────────────────
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const { data } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order');
  return (data as HomepageSection[]) ?? [];
}

export async function updateHomepageSection(id: string, s: Partial<HomepageSection>): Promise<void> {
  await supabase.from('homepage_sections').update({ ...s, updated_at: new Date().toISOString() }).eq('id', id);
}

// ─── Page Blocks ─────────────────────────────────────────────────────────────
export async function getPageBlocks(parentType: string, parentId: string): Promise<PageBlock[]> {
  const { data } = await supabase.from('page_blocks').select('*').eq('parent_type', parentType).eq('parent_id', parentId).eq('is_active', true).order('sort_order');
  return (data as PageBlock[]) ?? [];
}

export async function getAllPageBlocks(parentType: string, parentId: string): Promise<PageBlock[]> {
  const { data } = await supabase.from('page_blocks').select('*').eq('parent_type', parentType).eq('parent_id', parentId).order('sort_order');
  return (data as PageBlock[]) ?? [];
}

export async function createPageBlock(b: Partial<PageBlock>): Promise<void> {
  await supabase.from('page_blocks').insert(b);
}

export async function updatePageBlock(id: string, b: Partial<PageBlock>): Promise<void> {
  await supabase.from('page_blocks').update(b).eq('id', id);
}

export async function deletePageBlock(id: string): Promise<void> {
  await supabase.from('page_blocks').delete().eq('id', id);
}

// ─── Partners ──────────────────────────────────────────────────────────────────
export async function getActivePartners(): Promise<Partner[]> {
  const { data } = await supabase.from('partners').select('*').eq('is_active', true).order('sort_order');
  return (data as Partner[]) ?? [];
}

export async function getAllPartners(): Promise<Partner[]> {
  const { data } = await supabase.from('partners').select('*').order('sort_order');
  return (data as Partner[]) ?? [];
}

export async function createPartner(p: Partial<Partner>): Promise<void> {
  await supabase.from('partners').insert(p);
}

export async function updatePartner(id: string, p: Partial<Partner>): Promise<void> {
  await supabase.from('partners').update(p).eq('id', id);
}

export async function deletePartner(id: string): Promise<void> {
  await supabase.from('partners').delete().eq('id', id);
}

// ─── Lotteries ─────────────────────────────────────────────────────────────────
export async function getActiveLotteries(): Promise<Lottery[]> {
  const now = new Date().toISOString();
  const { data } = await supabase.from('lotteries').select('*').eq('is_active', true).or(`end_date.is.null,end_date.gte.${now}`).order('created_at', { ascending: false });
  return (data as Lottery[]) ?? [];
}

export async function getAllLotteries(): Promise<Lottery[]> {
  const { data } = await supabase.from('lotteries').select('*').order('created_at', { ascending: false });
  return (data as Lottery[]) ?? [];
}

export async function createLottery(l: Partial<Lottery>): Promise<void> {
  await supabase.from('lotteries').insert(l);
}

export async function updateLottery(id: string, l: Partial<Lottery>): Promise<void> {
  await supabase.from('lotteries').update(l).eq('id', id);
}

export async function deleteLottery(id: string): Promise<void> {
  await supabase.from('lotteries').delete().eq('id', id);
}

export async function getLotteryEntries(lotteryId: string): Promise<LotteryEntry[]> {
  const { data } = await supabase.from('lottery_entries').select('*').eq('lottery_id', lotteryId).order('created_at', { ascending: false });
  return (data as LotteryEntry[]) ?? [];
}

export async function createLotteryEntry(e: Partial<LotteryEntry>): Promise<void> {
  await supabase.from('lottery_entries').insert(e);
}

// ─── Announcement Banners ─────────────────────────────────────────────────────
export async function getActiveBanners(): Promise<AnnouncementBanner[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('announcement_banners')
    .select('*')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('sort_order');
  return (data as AnnouncementBanner[]) ?? [];
}

export async function getAllBanners(): Promise<AnnouncementBanner[]> {
  const { data } = await supabase.from('announcement_banners').select('*').order('sort_order');
  return (data as AnnouncementBanner[]) ?? [];
}

export async function createBanner(b: Partial<AnnouncementBanner>): Promise<void> {
  await supabase.from('announcement_banners').insert(b);
}

export async function updateBanner(id: string, b: Partial<AnnouncementBanner>): Promise<void> {
  await supabase.from('announcement_banners').update(b).eq('id', id);
}

export async function deleteBanner(id: string): Promise<void> {
  await supabase.from('announcement_banners').delete().eq('id', id);
}
