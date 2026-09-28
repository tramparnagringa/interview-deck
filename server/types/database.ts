/**
 * Types for supabase/migrations. Hand-written while there is no linked project; regenerate with
 * `supabase gen types typescript --local > server/types/database.ts` when the local stack runs.
 */
export interface Database {
  public: {
    Tables: {
      decks: {
        Row: { slug: string, name: string, short_name: string, tagline: string, color: string, is_free: boolean, sort: number }
        Insert: { slug: string, name: string, short_name: string, tagline?: string, color: string, is_free?: boolean, sort?: number }
        Update: Partial<Database['public']['Tables']['decks']['Insert']>
        Relationships: []
      }
      cards: {
        Row: { id: string, deck_slug: string, number: number, category: string, question: string, hint: string | null }
        Insert: { id?: string, deck_slug: string, number: number, category: string, question: string, hint?: string | null }
        Update: Partial<Database['public']['Tables']['cards']['Insert']>
        Relationships: [{ foreignKeyName: 'cards_deck_slug_fkey', columns: ['deck_slug'], isOneToOne: false, referencedRelation: 'decks', referencedColumns: ['slug'] }]
      }
      premium_members: {
        Row: { email: string, source: string, granted_at: string, revoked_at: string | null }
        Insert: { email: string, source?: string, granted_at?: string, revoked_at?: string | null }
        Update: Partial<Database['public']['Tables']['premium_members']['Insert']>
        Relationships: []
      }
      feedback_events: {
        Row: { id: number, user_id: string, card_id: string | null, kind: 'full' | 'locked', created_at: string }
        Insert: { user_id: string, card_id?: string | null, kind: 'full' | 'locked', created_at?: string }
        Update: Partial<Database['public']['Tables']['feedback_events']['Insert']>
        Relationships: []
      }
    }
    Views: {
      deck_summaries: {
        Row: { slug: string, name: string, short_name: string, tagline: string, color: string, is_free: boolean, sort: number, card_count: number }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
