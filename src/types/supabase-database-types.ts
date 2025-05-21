export interface CustomDatabase {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: string | null;
        };
      };
      backup_links: {
        Row: {
          id: string;
          url: string;
          description: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          url: string;
          description?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          url?: string;
          description?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      // Define other tables as needed
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
