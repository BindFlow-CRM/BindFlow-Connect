# BindFlow CRM

A full-stack CRM built specifically for independent insurance agents in the US.

## Tech Stack
- **Frontend**: React + Vite (artifact at `/`, slug: `bindflow`)
- **Backend**: Supabase (Auth + PostgreSQL database)
- **Styling**: Tailwind CSS v4 with custom dark design system
- **State**: React Query + Supabase client
- **DnD**: @hello-pangea/dnd (Kanban pipeline)
- **Charts**: Recharts
- **Forms**: react-hook-form + zod
- **Routing**: wouter

## Design System
- Background: `#0D1117` (navy — dark first)
- Primary CTA: `#00E5A0` (mint green)
- Secondary: `#00B4D8` (cyan)
- Cards: `#161B22`
- Popovers: `#1C2128`
- Borders: `#30363D`
- Muted text: `#8B949E`

## Pipeline Stage Colors
- Lead: `#8B949E`
- Quoted: `#00B4D8`
- Follow-up: `#F0B429`
- Closed Won: `#00E5A0`
- Active Policy: `#00C98A`
- Renewal Due: `#F85149`

## Environment Variables
All set in Replit secrets:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_PADDLE_CLIENT_TOKEN` — Paddle billing token
- `VITE_APP_URL` — App URL

## App Structure
```
artifacts/bindflow/src/
├── App.tsx                          # Root routing (wouter)
├── main.tsx                         # Entry + dark mode init
├── index.css                        # BindFlow design system
├── lib/
│   └── supabase.ts                  # Typed Supabase client
├── contexts/
│   └── AuthContext.tsx              # Auth + profile + org state
├── types/
│   └── database.ts                  # Full Supabase DB types
└── pages/
    ├── landing.tsx                  # Public marketing page
    ├── auth/
    │   ├── login.tsx                # Login (email + Google)
    │   ├── register.tsx             # Multi-step registration
    │   └── forgot-password.tsx      # Password reset
    └── dashboard/
        ├── layout.tsx               # Protected sidebar layout
        ├── index.tsx                # Dashboard (KPIs + charts + renewals)
        ├── pipeline.tsx             # Kanban drag-and-drop board
        ├── contacts/
        │   ├── index.tsx            # Contacts list + add dialog
        │   └── [id].tsx             # Contact detail (policies + activity)
        ├── calendar.tsx             # Calendar with renewals + reminders
        ├── reminders.tsx            # Reminders list + add/complete
        ├── referrals.tsx            # Referral tracker
        ├── templates.tsx            # Email templates CRUD
        └── settings/
            ├── index.tsx            # Profile settings
            ├── team.tsx             # Team members (invite/remove)
            └── billing.tsx          # Paddle subscription billing
```

## Database Tables (Supabase)
You must create these tables in your Supabase project:
- `organizations` — Agency workspaces
- `organization_members` — Workspace memberships (max 3)
- `profiles` — User profiles (extends auth.users)
- `pipeline_stages` — 6 default Kanban stages per org
- `contacts` — Client contacts
- `policies` — Insurance policies (linked to contacts)
- `deals` — Pipeline deals (linked to contacts + stages)
- `activities` — Activity timeline (calls, notes, emails)
- `reminders` — Task reminders
- `referrals` — Referral relationships between contacts
- `email_templates` — Email template library

## Key Patterns
- **Auth protection**: `DashboardLayout` checks `session` and redirects to `/login`
- **Data fetching**: `useQuery` + `supabase.from(...)` with `organization_id` filter
- **Mutations**: `useMutation` + `queryClient.invalidateQueries`
- **WhatsApp links**: `https://wa.me/1{phone}?text={message}`
- **Dark mode**: `document.documentElement.classList.add("dark")` in main.tsx

## Registration Flow
1. `supabase.auth.signUp()` — create user
2. Insert into `organizations` with owner_id
3. Insert into `profiles` with current_organization_id
4. Insert into `organization_members` as "owner"
5. Insert default 6 pipeline stages
6. Redirect to `/dashboard`

## Billing
Paddle.js v2 is loaded in `settings/billing.tsx` with `VITE_PADDLE_CLIENT_TOKEN`.
Set up real product/price IDs in Paddle dashboard and update `pri_monthly_bindflow` / `pri_annual_bindflow` price IDs.
