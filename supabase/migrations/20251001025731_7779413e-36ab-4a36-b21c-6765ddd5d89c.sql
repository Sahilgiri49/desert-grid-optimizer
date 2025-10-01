-- Add INSERT policies for all energy data tables
-- These tables need to accept data from the edge function

CREATE POLICY "Allow service role to insert solar data" 
ON public.solar_data 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to insert wind data" 
ON public.wind_data 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to insert battery data" 
ON public.battery_data 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to insert campus load data" 
ON public.campus_load_data 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to insert grid data" 
ON public.grid_data 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to insert energy mix" 
ON public.energy_mix 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to insert energy alerts" 
ON public.energy_alerts 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Also allow public inserts for campus load data (for target load updates)
CREATE POLICY "Allow public to insert campus load data" 
ON public.campus_load_data 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Allow public to update campus load data" 
ON public.campus_load_data 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);