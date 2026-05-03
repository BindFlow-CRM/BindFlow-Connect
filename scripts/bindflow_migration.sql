-- ============================================================
-- BindFlow CRM — Full Database Migration
-- Run this in Supabase SQL Editor (Schema: public)
-- Safe to run on a fresh project
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Helper: auto-update updated_at ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.slugify_org_name(input_text text)
returns text language sql immutable as $$
  select lower(regexp_replace(regexp_replace(coalesce(input_text, ''), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'));
$$;

-- ── Helper: generate a short, URL-safe referral code ─────────
create or replace function public.generate_referral_code()
returns text language sql as $$
  select replace(replace(encode(gen_random_bytes(6), 'base64'), '/', '-'), '+', '_');
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- ── organizations ────────────────────────────────────────────
create table if not exists public.organizations (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  owner_id             uuid references auth.users(id) on delete set null,
  plan                 text default 'trial',
  trial_ends_at        timestamptz,
  subscription_id      text,
  subscription_status  text default 'trialing',
  max_seats            int default 3,
  referred_by          text,
  pending_credits      int not null default 0,
  paddle_customer_id   text,
  referral_code        text unique default public.generate_referral_code(),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists organizations_owner_id_idx   on public.organizations(owner_id);
create index if not exists organizations_slug_idx        on public.organizations(slug);

create or replace trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

alter table public.organizations add column if not exists referred_by text;
alter table public.organizations add column if not exists pending_credits int not null default 0;
alter table public.organizations add column if not exists paddle_customer_id text;
alter table public.organizations add column if not exists referral_code text;
update public.organizations set referral_code = coalesce(referral_code, public.generate_referral_code()) where referral_code is null;
alter table public.organizations alter column referral_code set default public.generate_referral_code();
do $$ begin
  alter table public.organizations add constraint organizations_referral_code_key unique (referral_code);
exception when duplicate_object then null;
end $$;
create index if not exists organizations_referral_code_idx on public.organizations(referral_code);

-- ── profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  full_name               text,
  avatar_url              text,
  phone                   text,
  state                   text,
  license_number          text,
  agency_name             text,
  current_organization_id uuid references public.organizations(id) on delete set null,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists profiles_org_idx on public.profiles(current_organization_id);

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── organization_members ─────────────────────────────────────
create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  role            text default 'member',   -- 'owner' | 'admin' | 'member'
  invited_email   text,
  status          text default 'active',   -- 'active' | 'invited' | 'disabled'
  joined_at       timestamptz default now(),
  unique(organization_id, user_id)
);

create index if not exists org_members_org_idx  on public.organization_members(organization_id);
create index if not exists org_members_user_idx on public.organization_members(user_id);

-- ── pipeline_stages ──────────────────────────────────────────
create table if not exists public.pipeline_stages (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name            text not null,
  color           text not null default '#8B949E',
  position        int  not null default 0,
  is_default      boolean default false,
  created_at      timestamptz default now()
);

create index if not exists pipeline_stages_org_idx on public.pipeline_stages(organization_id, position);

-- ── contacts ─────────────────────────────────────────────────
create table if not exists public.contacts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  created_by      uuid references auth.users(id) on delete set null,
  assigned_to     uuid references auth.users(id) on delete set null,
  full_name       text not null,
  email           text,
  phone           text,
  date_of_birth   date,
  address         text,
  city            text,
  state           text,
  zip_code        text,
  lead_source     text,
  status          text default 'active',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists contacts_org_idx        on public.contacts(organization_id);
create index if not exists contacts_assigned_idx   on public.contacts(assigned_to);
create index if not exists contacts_full_name_idx  on public.contacts using gin (to_tsvector('english', full_name));

create or replace trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- ── policies ─────────────────────────────────────────────────
create table if not exists public.policies (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid references public.organizations(id) on delete cascade,
  contact_id              uuid references public.contacts(id) on delete cascade,
  pipeline_stage_id       uuid references public.pipeline_stages(id) on delete set null,
  policy_number           text,
  insurance_company       text,
  line_of_insurance       text,   -- 'auto' | 'home' | 'life' | 'health' | 'commercial' | etc.
  annual_premium          numeric(12,2),
  start_date              date,
  renewal_date            date,
  policy_status           text default 'active',  -- 'active' | 'lapsed' | 'cancelled' | 'pending'
  current_products        text[] default '{}',
  cross_sell_opportunities text[] default '{}',
  notes                   text,
  created_by              uuid references auth.users(id) on delete set null,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists policies_org_idx      on public.policies(organization_id);
create index if not exists policies_contact_idx  on public.policies(contact_id);
create index if not exists policies_renewal_idx  on public.policies(renewal_date) where policy_status = 'active';

create or replace trigger policies_updated_at
  before update on public.policies
  for each row execute function public.set_updated_at();

-- ── deals ────────────────────────────────────────────────────
create table if not exists public.deals (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid references public.organizations(id) on delete cascade,
  contact_id          uuid references public.contacts(id) on delete set null,
  policy_id           uuid references public.policies(id) on delete set null,
  stage_id            uuid references public.pipeline_stages(id) on delete set null,
  assigned_to         uuid references auth.users(id) on delete set null,
  title               text not null,
  value               numeric(12,2),
  expected_close_date date,
  position            int default 0,
  notes               text,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists deals_org_idx    on public.deals(organization_id);
create index if not exists deals_stage_idx  on public.deals(stage_id, position);
create index if not exists deals_contact_idx on public.deals(contact_id);

create or replace trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- ── activities ───────────────────────────────────────────────
create table if not exists public.activities (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  contact_id      uuid references public.contacts(id) on delete cascade,
  deal_id         uuid references public.deals(id) on delete set null,
  created_by      uuid references auth.users(id) on delete set null,
  type            text not null,  -- 'note' | 'call' | 'email' | 'whatsapp' | 'stage_change' | 'reminder'
  title           text,
  content         text,
  metadata        jsonb,
  created_at      timestamptz default now()
);

create index if not exists activities_org_idx      on public.activities(organization_id);
create index if not exists activities_contact_idx  on public.activities(contact_id);
create index if not exists activities_deal_idx     on public.activities(deal_id);
create index if not exists activities_created_idx  on public.activities(created_at desc);

-- ── reminders ────────────────────────────────────────────────
create table if not exists public.reminders (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  contact_id      uuid references public.contacts(id) on delete set null,
  deal_id         uuid references public.deals(id) on delete set null,
  policy_id       uuid references public.policies(id) on delete set null,
  assigned_to     uuid references auth.users(id) on delete set null,
  title           text not null,
  notes           text,
  due_date        timestamptz not null,
  reminder_type   text default 'general',  -- 'renewal' | 'follow_up' | 'general'
  status          text default 'pending',  -- 'pending' | 'completed' | 'dismissed'
  is_sent         boolean default false,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists reminders_org_idx      on public.reminders(organization_id);
create index if not exists reminders_due_date_idx on public.reminders(due_date) where status = 'pending';
create index if not exists reminders_assigned_idx on public.reminders(assigned_to);

create or replace trigger reminders_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

-- ── tags ─────────────────────────────────────────────────────
create table if not exists public.tags (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name            text not null,
  color           text default '#8B949E',
  created_at      timestamptz default now(),
  unique(organization_id, name)
);

create index if not exists tags_org_idx on public.tags(organization_id);

-- ── contact_tags ─────────────────────────────────────────────
create table if not exists public.contact_tags (
  contact_id uuid references public.contacts(id) on delete cascade,
  tag_id     uuid references public.tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

-- ── referrals ────────────────────────────────────────────────
create table if not exists public.referrals (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid references public.organizations(id) on delete cascade,
  referrer_contact_id uuid references public.contacts(id) on delete set null,
  referred_contact_id uuid references public.contacts(id) on delete set null,
  notes               text,
  created_at          timestamptz default now()
);

create index if not exists referrals_org_idx      on public.referrals(organization_id);
create index if not exists referrals_referrer_idx on public.referrals(referrer_contact_id);

-- ── email_templates ──────────────────────────────────────────
create table if not exists public.email_templates (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name            text not null,
  subject         text not null,
  body            text not null,
  template_type   text default 'general',  -- 'renewal' | 'follow_up' | 'general' | 'cross_sell'
  is_default      boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists email_templates_org_idx on public.email_templates(organization_id);

create or replace trigger email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.organizations        enable row level security;
alter table public.profiles             enable row level security;
alter table public.organization_members enable row level security;
alter table public.pipeline_stages      enable row level security;
alter table public.contacts             enable row level security;
alter table public.policies             enable row level security;
alter table public.deals                enable row level security;
alter table public.activities           enable row level security;
alter table public.reminders            enable row level security;
alter table public.tags                 enable row level security;
alter table public.contact_tags         enable row level security;
alter table public.referrals            enable row level security;
alter table public.email_templates      enable row level security;

-- ── Helper: is the calling user a member of an org? ──────────
create or replace function public.is_org_member(org_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.is_org_owner(org_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.organizations
    where id = org_id and owner_id = auth.uid()
  );
$$;

-- ── organizations ────────────────────────────────────────────
drop policy if exists "orgs: members can read"  on public.organizations;
drop policy if exists "orgs: owner can insert"  on public.organizations;
drop policy if exists "orgs: owner can update"  on public.organizations;

create policy "orgs: members can read"  on public.organizations
  for select using (public.is_org_member(id));

create policy "orgs: owner can insert"  on public.organizations
  for insert with check (owner_id = auth.uid());

create policy "orgs: owner can update"  on public.organizations
  for update using (owner_id = auth.uid());

-- ── profiles ─────────────────────────────────────────────────
drop policy if exists "profiles: own row" on public.profiles;

create policy "profiles: own row" on public.profiles
  for all using (id = auth.uid());

-- ── organization_members ─────────────────────────────────────
drop policy if exists "members: org members can read"  on public.organization_members;
drop policy if exists "members: org owners can manage" on public.organization_members;

create policy "members: org members can read"  on public.organization_members
  for select using (public.is_org_member(organization_id));

create policy "members: org owners can manage" on public.organization_members
  for all using (public.is_org_owner(organization_id));

-- ── Generic org-scoped policy factory ────────────────────────
-- (pipeline_stages, contacts, policies, deals, activities, reminders, tags, referrals, email_templates)
-- All share the same pattern: members can read/insert/update/delete within their org

do $$ begin
  -- pipeline_stages
  drop policy if exists "pipeline_stages: org members" on public.pipeline_stages;
  create policy "pipeline_stages: org members" on public.pipeline_stages
    for all using (public.is_org_member(organization_id));

  -- contacts
  drop policy if exists "contacts: org members" on public.contacts;
  create policy "contacts: org members" on public.contacts
    for all using (public.is_org_member(organization_id));

  -- policies
  drop policy if exists "policies: org members" on public.policies;
  create policy "policies: org members" on public.policies
    for all using (public.is_org_member(organization_id));

  -- deals
  drop policy if exists "deals: org members" on public.deals;
  create policy "deals: org members" on public.deals
    for all using (public.is_org_member(organization_id));

  -- activities
  drop policy if exists "activities: org members" on public.activities;
  create policy "activities: org members" on public.activities
    for all using (public.is_org_member(organization_id));

  -- reminders
  drop policy if exists "reminders: org members" on public.reminders;
  create policy "reminders: org members" on public.reminders
    for all using (public.is_org_member(organization_id));

  -- tags
  drop policy if exists "tags: org members" on public.tags;
  create policy "tags: org members" on public.tags
    for all using (public.is_org_member(organization_id));

  -- referrals
  drop policy if exists "referrals: org members" on public.referrals;
  create policy "referrals: org members" on public.referrals
    for all using (public.is_org_member(organization_id));

  -- email_templates
  drop policy if exists "email_templates: org members" on public.email_templates;
  create policy "email_templates: org members" on public.email_templates
    for all using (public.is_org_member(organization_id));
end $$;

-- contact_tags: inherit from contacts membership check
drop policy if exists "contact_tags: org members" on public.contact_tags;
create policy "contact_tags: org members" on public.contact_tags
  for all using (
    exists (
      select 1 from public.contacts c
      where c.id = contact_id and public.is_org_member(c.organization_id)
    )
  );

-- ============================================================
-- AUTO-PROVISION: create profile + org on sign-up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  org_id   uuid;
  org_slug text;
  base_name text;
begin
  -- Create profile
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  -- Create org (slug = email prefix, deduplicated)
  base_name := coalesce(new.raw_user_meta_data->>'agency_name', split_part(new.email, '@', 1) || ' Agency');
  org_slug := public.slugify_org_name(base_name);
  if org_slug = '' then
    org_slug := substr(replace(new.id::text, '-', ''), 1, 12);
  end if;

  -- ensure slug uniqueness
  if exists (select 1 from public.organizations where slug = org_slug) then
    org_slug := org_slug || '-' || substr(new.id::text, 1, 6);
  end if;

  insert into public.organizations (name, slug, owner_id, trial_ends_at)
  values (
    base_name,
    org_slug,
    new.id,
    now() + interval '14 days'
  )
  returning id into org_id;

  -- Add owner as member
  insert into public.organization_members (organization_id, user_id, role, status)
  values (org_id, new.id, 'owner', 'active');

  -- Link profile to org
  update public.profiles set current_organization_id = org_id where id = new.id;

  -- Seed default pipeline stages
  insert into public.pipeline_stages (organization_id, name, color, position, is_default) values
    (org_id, 'Lead', '#8B949E', 0, true),
    (org_id, 'Quoted', '#00B4D8', 1, false),
    (org_id, 'Follow-Up', '#F0B429', 2, false),
    (org_id, 'Bound', '#00E5A0', 3, false),
    (org_id, 'Renewal Due', '#F85149', 4, false);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- UTILITY VIEW: policies due for renewal
-- ============================================================
create or replace view public.policies_due_for_renewal as
  select
    p.*,
    c.full_name  as contact_name,
    c.email      as contact_email,
    c.phone      as contact_phone,
    (p.renewal_date - current_date) as days_until_renewal
  from public.policies p
  join public.contacts c on c.id = p.contact_id
  where p.policy_status = 'active'
    and p.renewal_date between current_date and current_date + interval '90 days'
  order by p.renewal_date;

-- ============================================================
-- Done. All tables, indexes, RLS, triggers, and auto-provisioning
-- are ready. Run this once on a clean Supabase project.
-- ============================================================
