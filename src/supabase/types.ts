export type Json =
      | string
      | number
      | boolean
      | null
      | { [key: string]: Json | undefined }
      | Json[]

    export type Database = {
      // Allows to automatically instantiate createClient with right options
      // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
      __InternalSupabase: {
        PostgrestVersion: "13.0.5"
      }
      public: {
        Tables: {
          categories: {
            Row: {
              actif: boolean | null
              created_at: string | null
              description: string | null
              id: string
              nom: string
              updated_at: string | null
            }
            Insert: {
              actif?: boolean | null
              created_at?: string | null
              description?: string | null
              id?: string
              nom: string
              updated_at?: string | null
            }
            Update: {
              actif?: boolean | null
              created_at?: string | null
              description?: string | null
              id?: string
              nom?: string
              updated_at?: string | null
            }
            Relationships: []
          }
          order_items: {
            Row: {
              id: string
              order_id: string
              price_at_time: number
              product_id: string
              quantity: number
            }
            Insert: {
              id?: string
              order_id: string
              price_at_time: number
              product_id: string
              quantity: number
            }
            Update: {
              id?: string
              order_id?: string
              price_at_time?: number
              product_id?: string
              quantity?: number
            }
            Relationships: [
              {
                foreignKeyName: "order_items_order_id_fkey"
                columns: ["order_id"]
                isOneToOne: false
                referencedRelation: "orders"
                referencedColumns: ["id"]
              },
              {
                foreignKeyName: "order_items_product_id_fkey"
                columns: ["product_id"]
                isOneToOne: false
                referencedRelation: "products"
                referencedColumns: ["id"]
              },
            ]
          }
          orders: {
            Row: {
              created_at: string | null
              date_retrait: string | null
              id: string
              payment_id: string | null
              status: string | null
              total: number
              updated_at: string | null
              user_id: string
            }
            Insert: {
              created_at?: string | null
              date_retrait?: string | null
              id?: string
              payment_id?: string | null
              status?: string | null
              total: number
              updated_at?: string | null
              user_id: string
            }
            Update: {
              created_at?: string | null
              date_retrait?: string | null
              id?: string
              payment_id?: string | null
              status?: string | null
              total?: number
              updated_at?: string | null
              user_id?: string
            }
            Relationships: [
              {
                foreignKeyName: "orders_user_id_fkey"
                columns: ["user_id"]
                isOneToOne: false
                referencedRelation: "profiles"
                referencedColumns: ["id"]
              },
            ]
          }
          product_media: {
            Row: {
              alt_text: string | null
              created_at: string | null
              id: string
              media_order: number
              media_type: string
              media_url: string
              product_id: string
              updated_at: string | null
            }
            Insert: {
              alt_text?: string | null
              created_at?: string | null
              id?: string
              media_order?: number
              media_type: string
              media_url: string
              product_id: string
              updated_at?: string | null
            }
            Update: {
              alt_text?: string | null
              created_at?: string | null
              id?: string
              media_order?: number
              media_type?: string
              media_url?: string
              product_id?: string
              updated_at?: string | null
            }
            Relationships: [
              {
                foreignKeyName: "product_media_product_id_fkey"
                columns: ["product_id"]
                isOneToOne: false
                referencedRelation: "products"
                referencedColumns: ["id"]
              }
            ]
          }
          product_price_tiers: {
            Row: {
              id: string
              product_id: string
              quantity: number
              price: number
              tier_order: number
              created_at: string | null
              updated_at: string | null
            }
            Insert: {
              id?: string
              product_id: string
              quantity: number
              price: number
              tier_order?: number
              created_at?: string | null
              updated_at?: string | null
            }
            Update: {
              id?: string
              product_id?: string
              quantity?: number
              price?: number
              tier_order?: number
              created_at?: string | null
              updated_at?: string | null
            }
            Relationships: [
              {
                foreignKeyName: "product_price_tiers_product_id_fkey"
                columns: ["product_id"]
                isOneToOne: false
                referencedRelation: "products"
                referencedColumns: ["id"]
              },
            ]
          }
          products: {
            Row: {
              actif: boolean | null
              categorie: string
              created_at: string | null
              delai_retrait_unite: string | null
              delai_retrait_valeur: number | null
              id: string
              image_url: string | null
              nom: string
              prix: number
              retrait_planifie: boolean | null
              use_price_tiers: boolean | null
              updated_at: string | null
            }
            Insert: {
              actif?: boolean | null
              categorie: string
              created_at?: string | null
              delai_retrait_unite?: string | null
              delai_retrait_valeur?: number | null
              id?: string
              image_url?: string | null
              nom: string
              prix: number
              retrait_planifie?: boolean | null
              use_price_tiers?: boolean | null
              updated_at?: string | null
            }
            Update: {
              actif?: boolean | null
              categorie?: string
              created_at?: string | null
              delai_retrait_unite?: string | null
              delai_retrait_valeur?: number | null
              id?: string
              image_url?: string | null
              nom?: string
              prix?: number
              retrait_planifie?: boolean | null
              use_price_tiers?: boolean | null
              updated_at?: string | null
            }
            Relationships: []
          }
          profiles: {
            Row: {
              created_at: string | null
              email: string
              id: string
              name: string
              phone: string | null
              role: string | null
              updated_at: string | null
            }
            Insert: {
              created_at?: string | null
              email: string
              id: string
              name: string
              phone?: string | null
              role?: string | null
              updated_at?: string | null
            }
            Update: {
              created_at?: string | null
              email?: string
              id?: string
              name?: string
              phone?: string | null
              role?: string | null
              updated_at?: string | null
            }
            Relationships: []
          }
          site_settings: {
            Row: {
              created_at: string | null
              description: string | null
              id: string
              setting_key: string
              setting_type: string
              setting_value: string | null
              updated_at: string | null
            }
            Insert: {
              created_at?: string | null
              description?: string | null
              id?: string
              setting_key: string
              setting_type?: string
              setting_value?: string | null
              updated_at?: string | null
            }
            Update: {
              created_at?: string | null
              description?: string | null
              id?: string
              setting_key?: string
              setting_type?: string
              setting_value?: string | null
              updated_at?: string | null
            }
            Relationships: []
          }
        }
        Views: {
          [_ in never]: never
        }
        Functions: {
          [_ in never]: never
        }
        Enums: {
          [_ in never]: never
        }
        CompositeTypes: {
          [_ in never]: never
        }
      }
    }

    type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

    type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

    export type Tables<
      PublicTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
      TableName extends PublicTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
        ? keyof (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
            DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])
        : never = never,
    > = PublicTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
    }
      ? (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R
        }
        ? R
        : never
      : PublicTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
        ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
          }
          ? R
          : never
        : never

    export type TablesInsert<
      PublicTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
      TableName extends PublicTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
        ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
    > = PublicTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
    }
      ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I
        }
        ? I
        : never
      : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
            Insert: infer I
          }
          ? I
          : never
        : never

    export type TablesUpdate<
      PublicTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
      TableName extends PublicTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
        ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
    > = PublicTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
    }
      ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U
        }
        ? U
        : never
      : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
            Update: infer U
          }
          ? U
          : never
        : never

    export type Enums<
      PublicEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
      EnumName extends PublicEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
        ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
    > = PublicEnumNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
    }
      ? DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
      : PublicEnumNameOrOptions extends keyof DefaultSchema["Enums"]
        ? DefaultSchema["Enums"][PublicEnumNameOrOptions]
        : never

    export type CompositeTypes<
      PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
      CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
    > = PublicCompositeTypeNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
    }
      ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
      : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
        ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
        : never

    export const Constants = {
      public: {
        Enums: {},
      },
    } as const