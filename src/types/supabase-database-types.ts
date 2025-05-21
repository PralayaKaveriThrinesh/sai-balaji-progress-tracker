
import { Database } from '@/integrations/supabase/types';

// Define the tables that exist in our database but might not be in the generated types
export interface CustomDatabase extends Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password: string;
          role: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password?: string;
          role?: string;
          created_at?: string;
        };
      };
      backup_links: {
        Row: {
          id: string;
          url: string;
          description: string;
          created_by: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          url: string;
          description?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          description?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          leader_id: string;
          workers: number;
          total_work: number;
          completed_work: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          leader_id: string;
          workers: number;
          total_work: number;
          completed_work?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          leader_id?: string;
          workers?: number;
          total_work?: number;
          completed_work?: number;
          created_at?: string;
        };
      };
      progress_updates: {
        Row: {
          id: string;
          project_id: string;
          date: string;
          completed_work: number;
          time_taken: number;
          notes?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          date: string;
          completed_work: number;
          time_taken: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          date?: string;
          completed_work?: number;
          time_taken?: number;
          notes?: string;
          created_at?: string;
        };
      };
      payment_requests: {
        Row: {
          id: string;
          project_id: string;
          date: string;
          status: string;
          total_amount: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          date: string;
          status?: string;
          total_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          date?: string;
          status?: string;
          total_amount?: number;
          created_at?: string;
        };
      };
      payment_purposes: {
        Row: {
          id: string;
          payment_request_id: string;
          type: string;
          amount: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          payment_request_id: string;
          type: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_request_id?: string;
          type?: string;
          amount?: number;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at?: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
    } & Database['public']['Tables'];
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}
