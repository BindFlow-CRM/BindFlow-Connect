export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string | null;
          plan: string | null;
          trial_ends_at: string | null;
          subscription_id: string | null;
          subscription_status: string | null;
          max_seats: number | null;
          referred_by: string | null;
          pending_credits: number | null;
          paddle_customer_id: string | null;
          referral_code: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id?: string | null;
          plan?: string | null;
          trial_ends_at?: string | null;
          subscription_id?: string | null;
          subscription_status?: string | null;
          max_seats?: number | null;
          referred_by?: string | null;
          pending_credits?: number | null;
          paddle_customer_id?: string | null;
          referral_code?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          role: string | null;
          invited_email: string | null;
          status: string | null;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          role?: string | null;
          invited_email?: string | null;
          status?: string | null;
          joined_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          state: string | null;
          license_number: string | null;
          agency_name: string | null;
          current_organization_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          state?: string | null;
          license_number?: string | null;
          agency_name?: string | null;
          current_organization_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      pipeline_stages: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          color: string;
          position: number;
          is_default: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          color: string;
          position: number;
          is_default?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["pipeline_stages"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string | null;
          created_by: string | null;
          assigned_to: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          lead_source: string | null;
          status: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          created_by?: string | null;
          assigned_to?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          lead_source?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      policies: {
        Row: {
          id: string;
          organization_id: string | null;
          contact_id: string | null;
          pipeline_stage_id: string | null;
          policy_number: string | null;
          insurance_company: string | null;
          line_of_insurance: string | null;
          annual_premium: number | null;
          start_date: string | null;
          renewal_date: string | null;
          policy_status: string | null;
          current_products: string[] | null;
          cross_sell_opportunities: string[] | null;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          contact_id?: string | null;
          pipeline_stage_id?: string | null;
          policy_number?: string | null;
          insurance_company?: string | null;
          line_of_insurance?: string | null;
          annual_premium?: number | null;
          start_date?: string | null;
          renewal_date?: string | null;
          policy_status?: string | null;
          current_products?: string[] | null;
          cross_sell_opportunities?: string[] | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["policies"]["Insert"]>;
      };
      deals: {
        Row: {
          id: string;
          organization_id: string | null;
          contact_id: string | null;
          policy_id: string | null;
          stage_id: string | null;
          assigned_to: string | null;
          title: string;
          value: number | null;
          expected_close_date: string | null;
          position: number | null;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          contact_id?: string | null;
          policy_id?: string | null;
          stage_id?: string | null;
          assigned_to?: string | null;
          title: string;
          value?: number | null;
          expected_close_date?: string | null;
          position?: number | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
      };
      activities: {
        Row: {
          id: string;
          organization_id: string | null;
          contact_id: string | null;
          deal_id: string | null;
          created_by: string | null;
          type: string;
          title: string | null;
          content: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          contact_id?: string | null;
          deal_id?: string | null;
          created_by?: string | null;
          type: string;
          title?: string | null;
          content?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
      };
      reminders: {
        Row: {
          id: string;
          organization_id: string | null;
          contact_id: string | null;
          deal_id: string | null;
          policy_id: string | null;
          assigned_to: string | null;
          title: string;
          notes: string | null;
          due_date: string;
          reminder_type: string | null;
          status: string | null;
          is_sent: boolean | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          contact_id?: string | null;
          deal_id?: string | null;
          policy_id?: string | null;
          assigned_to?: string | null;
          title: string;
          notes?: string | null;
          due_date: string;
          reminder_type?: string | null;
          status?: string | null;
          is_sent?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
      };
      tags: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          color: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          color?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      contact_tags: {
        Row: {
          contact_id: string;
          tag_id: string;
        };
        Insert: {
          contact_id: string;
          tag_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_tags"]["Insert"]>;
      };
      referrals: {
        Row: {
          id: string;
          organization_id: string | null;
          referrer_contact_id: string | null;
          referred_contact_id: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          referrer_contact_id?: string | null;
          referred_contact_id?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Insert"]>;
      };
      email_templates: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          subject: string;
          body: string;
          template_type: string | null;
          is_default: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          subject: string;
          body: string;
          template_type?: string | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_templates"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Policy = Database["public"]["Tables"]["policies"]["Row"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type PipelineStage = Database["public"]["Tables"]["pipeline_stages"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type EmailTemplate = Database["public"]["Tables"]["email_templates"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
