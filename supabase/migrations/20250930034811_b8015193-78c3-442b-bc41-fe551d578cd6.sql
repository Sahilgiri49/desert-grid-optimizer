-- Create all the required tables for the energy management system
CREATE TABLE IF NOT EXISTS public.solar_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  solar_irradiance NUMERIC(8,2) NOT NULL DEFAULT 0,
  solar_power_generated NUMERIC(8,2) NOT NULL DEFAULT 0,
  solar_power_forecast NUMERIC(8,2) NOT NULL DEFAULT 0,
  cloud_cover_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  temperature_celsius NUMERIC(5,2) NOT NULL DEFAULT 25
);

CREATE TABLE IF NOT EXISTS public.wind_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wind_speed NUMERIC(5,2) NOT NULL DEFAULT 0,
  wind_direction NUMERIC(5,2) NOT NULL DEFAULT 0,
  wind_power_generated NUMERIC(8,2) NOT NULL DEFAULT 0,
  wind_power_forecast NUMERIC(8,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.battery_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  state_of_charge NUMERIC(5,2) NOT NULL DEFAULT 50,
  charge_rate NUMERIC(8,2) NOT NULL DEFAULT 0,
  capacity_kwh NUMERIC(8,2) NOT NULL DEFAULT 1000,
  temperature_celsius NUMERIC(5,2) NOT NULL DEFAULT 25,
  health_percentage NUMERIC(5,2) NOT NULL DEFAULT 95
);

CREATE TABLE IF NOT EXISTS public.campus_load_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_load_kw NUMERIC(8,2) NOT NULL DEFAULT 300,
  hvac_load_kw NUMERIC(8,2) NOT NULL DEFAULT 120,
  lighting_load_kw NUMERIC(8,2) NOT NULL DEFAULT 60,
  equipment_load_kw NUMERIC(8,2) NOT NULL DEFAULT 90,
  other_load_kw NUMERIC(8,2) NOT NULL DEFAULT 30,
  load_forecast_kw NUMERIC(8,2) NOT NULL DEFAULT 310,
  target_load_kw NUMERIC(8,2) NOT NULL DEFAULT 300
);

CREATE TABLE IF NOT EXISTS public.grid_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  grid_import_kw NUMERIC(8,2) NOT NULL DEFAULT 0,
  grid_export_kw NUMERIC(8,2) NOT NULL DEFAULT 0,
  grid_frequency NUMERIC(5,2) NOT NULL DEFAULT 50,
  voltage_l1 NUMERIC(6,2) NOT NULL DEFAULT 230,
  voltage_l2 NUMERIC(6,2) NOT NULL DEFAULT 230,
  voltage_l3 NUMERIC(6,2) NOT NULL DEFAULT 230
);

CREATE TABLE IF NOT EXISTS public.energy_mix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  solar_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  wind_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  battery_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  grid_percentage NUMERIC(5,2) NOT NULL DEFAULT 100,
  total_generation_kw NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_consumption_kw NUMERIC(8,2) NOT NULL DEFAULT 300,
  self_consumption_percentage NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.energy_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alert_type VARCHAR(20) NOT NULL DEFAULT 'info',
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for all tables
ALTER TABLE public.solar_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wind_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battery_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_load_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_mix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON public.solar_data FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.wind_data FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.battery_data FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.campus_load_data FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.grid_data FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.energy_mix FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.energy_alerts FOR SELECT USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.solar_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wind_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battery_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_load_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.grid_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_mix;
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_alerts;