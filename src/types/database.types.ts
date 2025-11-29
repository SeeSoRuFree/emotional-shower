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
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          current_cohort_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          current_cohort_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          current_cohort_id?: string | null;
          updated_at?: string;
        };
      };
      cohorts: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          description: string | null;
          status: 'recruiting' | 'active' | 'completed';
          record_type: 'both' | 'self_care_only' | 'kindness_only';
          max_participants: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          description?: string | null;
          status?: 'recruiting' | 'active' | 'completed';
          record_type?: 'both' | 'self_care_only' | 'kindness_only';
          max_participants?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          description?: string | null;
          status?: 'recruiting' | 'active' | 'completed';
          record_type?: 'both' | 'self_care_only' | 'kindness_only';
          max_participants?: number | null;
          updated_at?: string;
        };
      };
      user_cohorts: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          joined_at: string;
          completed_at: string | null;
          status: 'active' | 'completed' | 'failed';
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          joined_at?: string;
          completed_at?: string | null;
          status?: 'active' | 'completed' | 'failed';
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          joined_at?: string;
          completed_at?: string | null;
          status?: 'active' | 'completed' | 'failed';
        };
      };
      challenges: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          completed_days: number[];
          status: 'waiting' | 'approved' | 'active' | 'completed' | 'failed';
          applied_at: string;
          approved_at: string | null;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          completed_days?: number[];
          status?: 'waiting' | 'approved' | 'active' | 'completed' | 'failed';
          applied_at?: string;
          approved_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          completed_days?: number[];
          status?: 'waiting' | 'approved' | 'active' | 'completed' | 'failed';
          applied_at?: string;
          approved_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      daily_records: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          day: number;
          self_care_actions: Json;
          kindness_actions: Json;
          quote: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          day: number;
          self_care_actions?: Json;
          kindness_actions?: Json;
          quote?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          day?: number;
          self_care_actions?: Json;
          kindness_actions?: Json;
          quote?: string | null;
          is_completed?: boolean;
          updated_at?: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          type: 'pre' | 'post';
          responses: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          type: 'pre' | 'post';
          responses: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          type?: 'pre' | 'post';
          responses?: Json;
          created_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          room_id: string;
          content: string;
          recommended_quote: string | null;
          likes: number;
          anonymous_name: string;
          avatar: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          room_id: string;
          content: string;
          recommended_quote?: string | null;
          likes?: number;
          anonymous_name: string;
          avatar: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          room_id?: string;
          content?: string;
          recommended_quote?: string | null;
          likes?: number;
          anonymous_name?: string;
          avatar?: string;
          created_at?: string;
        };
      };
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          likes: number;
          is_system_quote: boolean;
          anonymous_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          likes?: number;
          is_system_quote?: boolean;
          anonymous_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          likes?: number;
          is_system_quote?: boolean;
          anonymous_name?: string;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          name: string;
          email: string;
          motivation: string;
          status: 'pending' | 'approved' | 'rejected';
          code: string | null;
          cohort_id: string | null;
          applied_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          motivation: string;
          status?: 'pending' | 'approved' | 'rejected';
          code?: string | null;
          cohort_id?: string | null;
          applied_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          motivation?: string;
          status?: 'pending' | 'approved' | 'rejected';
          code?: string | null;
          cohort_id?: string | null;
          applied_at?: string;
          processed_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {
      increment_post_likes: {
        Args: { post_id: string };
        Returns: void;
      };
      increment_comment_likes: {
        Args: { comment_id: string };
        Returns: void;
      };
    };
    Enums: {
      cohort_status: 'recruiting' | 'active' | 'completed';
      record_type_enum: 'both' | 'self_care_only' | 'kindness_only';
      participation_status: 'active' | 'completed' | 'failed';
      challenge_status: 'waiting' | 'approved' | 'active' | 'completed' | 'failed';
      survey_type: 'pre' | 'post';
      application_status: 'pending' | 'approved' | 'rejected';
    };
  };
}
