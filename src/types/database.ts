export type Database = {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          content: string;
          excerpt: string | null;
          slug: string;
          image_url: string | null;
          status: 'draft' | 'published';
          author_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          slug: string;
          image_url?: string | null;
          status?: 'draft' | 'published';
          author_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          slug?: string;
          image_url?: string | null;
          status?: 'draft' | 'published';
          author_id?: string | null;
        };
      };
      gallery: {
        Row: {
          id: string;
          created_at: string;
          url: string;
          caption: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          url: string;
          caption?: string | null;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          url?: string;
          caption?: string | null;
          display_order?: number;
        };
      };
      achievements: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          achievement_date: string | null;
          icon: string | null;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          achievement_date?: string | null;
          icon?: string | null;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          achievement_date?: string | null;
          icon?: string | null;
          display_order?: number;
        };
      };
      goals: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'done';
          deadline: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done';
          deadline?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done';
          deadline?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          is_read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
