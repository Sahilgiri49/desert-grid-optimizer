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
      battery_data: {
        Row: {
          capacity_kwh: number
          charge_rate: number
          health_percentage: number
          id: string
          state_of_charge: number
          temperature_celsius: number
          timestamp: string
        }
        Insert: {
          capacity_kwh?: number
          charge_rate?: number
          health_percentage?: number
          id?: string
          state_of_charge?: number
          temperature_celsius?: number
          timestamp?: string
        }
        Update: {
          capacity_kwh?: number
          charge_rate?: number
          health_percentage?: number
          id?: string
          state_of_charge?: number
          temperature_celsius?: number
          timestamp?: string
        }
        Relationships: []
      }
      campus_load_data: {
        Row: {
          equipment_load_kw: number
          hvac_load_kw: number
          id: string
          lighting_load_kw: number
          load_forecast_kw: number
          other_load_kw: number
          target_load_kw: number
          timestamp: string
          total_load_kw: number
        }
        Insert: {
          equipment_load_kw?: number
          hvac_load_kw?: number
          id?: string
          lighting_load_kw?: number
          load_forecast_kw?: number
          other_load_kw?: number
          target_load_kw?: number
          timestamp?: string
          total_load_kw?: number
        }
        Update: {
          equipment_load_kw?: number
          hvac_load_kw?: number
          id?: string
          lighting_load_kw?: number
          load_forecast_kw?: number
          other_load_kw?: number
          target_load_kw?: number
          timestamp?: string
          total_load_kw?: number
        }
        Relationships: []
      }
      energy_alerts: {
        Row: {
          alert_type: string
          category: string
          description: string
          id: string
          is_active: boolean
          priority: number
          recommendation: string | null
          timestamp: string
          title: string
        }
        Insert: {
          alert_type?: string
          category: string
          description: string
          id?: string
          is_active?: boolean
          priority?: number
          recommendation?: string | null
          timestamp?: string
          title: string
        }
        Update: {
          alert_type?: string
          category?: string
          description?: string
          id?: string
          is_active?: boolean
          priority?: number
          recommendation?: string | null
          timestamp?: string
          title?: string
        }
        Relationships: []
      }
      energy_mix: {
        Row: {
          battery_percentage: number
          grid_percentage: number
          id: string
          self_consumption_percentage: number
          solar_percentage: number
          timestamp: string
          total_consumption_kw: number
          total_generation_kw: number
          wind_percentage: number
        }
        Insert: {
          battery_percentage?: number
          grid_percentage?: number
          id?: string
          self_consumption_percentage?: number
          solar_percentage?: number
          timestamp?: string
          total_consumption_kw?: number
          total_generation_kw?: number
          wind_percentage?: number
        }
        Update: {
          battery_percentage?: number
          grid_percentage?: number
          id?: string
          self_consumption_percentage?: number
          solar_percentage?: number
          timestamp?: string
          total_consumption_kw?: number
          total_generation_kw?: number
          wind_percentage?: number
        }
        Relationships: []
      }
      grid_data: {
        Row: {
          grid_export_kw: number
          grid_frequency: number
          grid_import_kw: number
          id: string
          timestamp: string
          voltage_l1: number
          voltage_l2: number
          voltage_l3: number
        }
        Insert: {
          grid_export_kw?: number
          grid_frequency?: number
          grid_import_kw?: number
          id?: string
          timestamp?: string
          voltage_l1?: number
          voltage_l2?: number
          voltage_l3?: number
        }
        Update: {
          grid_export_kw?: number
          grid_frequency?: number
          grid_import_kw?: number
          id?: string
          timestamp?: string
          voltage_l1?: number
          voltage_l2?: number
          voltage_l3?: number
        }
        Relationships: []
      }
      solar_data: {
        Row: {
          cloud_cover_percentage: number
          id: string
          solar_irradiance: number
          solar_power_forecast: number
          solar_power_generated: number
          temperature_celsius: number
          timestamp: string
        }
        Insert: {
          cloud_cover_percentage?: number
          id?: string
          solar_irradiance?: number
          solar_power_forecast?: number
          solar_power_generated?: number
          temperature_celsius?: number
          timestamp?: string
        }
        Update: {
          cloud_cover_percentage?: number
          id?: string
          solar_irradiance?: number
          solar_power_forecast?: number
          solar_power_generated?: number
          temperature_celsius?: number
          timestamp?: string
        }
        Relationships: []
      }
      wind_data: {
        Row: {
          id: string
          timestamp: string
          wind_direction: number
          wind_power_forecast: number
          wind_power_generated: number
          wind_speed: number
        }
        Insert: {
          id?: string
          timestamp?: string
          wind_direction?: number
          wind_power_forecast?: number
          wind_power_generated?: number
          wind_speed?: number
        }
        Update: {
          id?: string
          timestamp?: string
          wind_direction?: number
          wind_power_forecast?: number
          wind_power_generated?: number
          wind_speed?: number
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

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
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
