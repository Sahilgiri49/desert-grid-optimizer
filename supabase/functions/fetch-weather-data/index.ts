import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rajasthan coordinates (Jaipur as center)
const LATITUDE = 26.9124;
const LONGITUDE = 75.7873;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Fetching weather and generating energy data...');

    // Generate realistic solar data based on time of day
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Solar irradiance simulation (peak at noon, zero at night)
    let solarIrradiance = 0;
    if (hour >= 6 && hour <= 18) {
      const solarAngle = ((hour - 6) + minute / 60) / 12; // 0 to 1 from 6AM to 6PM
      solarIrradiance = Math.sin(solarAngle * Math.PI) * 1000; // Peak 1000 W/m²
      // Add some randomness
      solarIrradiance *= (0.8 + Math.random() * 0.4); // ±20% variation
    }

    // Solar power generation (assuming 500kW installation capacity)
    const solarPowerGenerated = (solarIrradiance / 1000) * 500 * (0.85 + Math.random() * 0.15); // 85-100% efficiency

    // Wind simulation (varies throughout day with some randomness)
    const baseWindSpeed = 3 + Math.sin((hour + minute/60) * Math.PI / 12) * 4 + Math.random() * 3; // 0-10 m/s
    const windDirection = Math.random() * 360;
    
    // Wind power generation (assuming 200kW wind capacity, cut-in at 3 m/s)
    let windPowerGenerated = 0;
    if (baseWindSpeed > 3) {
      windPowerGenerated = Math.min((baseWindSpeed - 3) / 12 * 200, 200) * (0.7 + Math.random() * 0.3);
    }

    // Battery simulation (cycling based on solar availability)
    const batteryCapacity = 1000; // 1 MWh
    const currentSoC = Math.max(20, Math.min(95, 50 + Math.sin((hour + minute/60) * Math.PI / 6) * 30)); // 20-95% SoC
    
    // Battery charge/discharge rate based on energy balance
    const totalGeneration = solarPowerGenerated + windPowerGenerated;
    const campusLoad = 300 + Math.sin((hour + minute/60) * Math.PI / 8) * 150 + Math.random() * 50; // 150-500 kW load
    
    let chargeRate = 0;
    if (totalGeneration > campusLoad && currentSoC < 90) {
      chargeRate = Math.min((totalGeneration - campusLoad) * 0.8, 200); // Charge at up to 200kW
    } else if (totalGeneration < campusLoad && currentSoC > 25) {
      chargeRate = -Math.min((campusLoad - totalGeneration) * 0.6, 150); // Discharge at up to 150kW
    }

    // Grid interaction
    const netLoad = campusLoad - totalGeneration + chargeRate;
    const gridImport = Math.max(0, netLoad);
    const gridExport = Math.max(0, -netLoad);

    // Temperature simulation
    const baseTemp = 25 + Math.sin((hour + minute/60) * Math.PI / 12) * 15; // 10-40°C daily cycle
    const temperature = baseTemp + (Math.random() - 0.5) * 4; // ±2°C variation

    // Cloud cover simulation
    const cloudCover = Math.max(0, Math.min(100, 30 + Math.sin(hour * Math.PI / 8) * 40 + (Math.random() - 0.5) * 30));

    // Insert solar data
    const { error: solarError } = await supabaseClient
      .from('solar_data')
      .insert({
        solar_irradiance: Number(solarIrradiance.toFixed(2)),
        solar_power_generated: Number(solarPowerGenerated.toFixed(2)),
        solar_power_forecast: Number((solarPowerGenerated * 1.05).toFixed(2)), // 5% optimistic forecast
        cloud_cover_percentage: Number(cloudCover.toFixed(2)),
        temperature_celsius: Number(temperature.toFixed(2))
      });

    if (solarError) console.error('Solar data insert error:', solarError);

    // Insert wind data
    const { error: windError } = await supabaseClient
      .from('wind_data')
      .insert({
        wind_speed: Number(baseWindSpeed.toFixed(2)),
        wind_direction: Number(windDirection.toFixed(2)),
        wind_power_generated: Number(windPowerGenerated.toFixed(2)),
        wind_power_forecast: Number((windPowerGenerated * 1.02).toFixed(2)) // 2% optimistic forecast
      });

    if (windError) console.error('Wind data insert error:', windError);

    // Insert battery data
    const { error: batteryError } = await supabaseClient
      .from('battery_data')
      .insert({
        state_of_charge: Number(currentSoC.toFixed(2)),
        charge_rate: Number(chargeRate.toFixed(2)),
        capacity_kwh: batteryCapacity,
        temperature_celsius: Number((temperature - 5).toFixed(2)), // Battery runs cooler
        health_percentage: 95 + Math.random() * 4 // 95-99% health
      });

    if (batteryError) console.error('Battery data insert error:', batteryError);

    // Insert campus load data
    const { error: loadError } = await supabaseClient
      .from('campus_load_data')
      .insert({
        total_load_kw: Number(campusLoad.toFixed(2)),
        hvac_load_kw: Number((campusLoad * 0.4).toFixed(2)),
        lighting_load_kw: Number((campusLoad * 0.2).toFixed(2)),
        equipment_load_kw: Number((campusLoad * 0.3).toFixed(2)),
        other_load_kw: Number((campusLoad * 0.1).toFixed(2)),
        load_forecast_kw: Number((campusLoad * 1.03).toFixed(2)) // 3% forecast increase
      });

    if (loadError) console.error('Load data insert error:', loadError);

    // Insert grid data
    const { error: gridError } = await supabaseClient
      .from('grid_data')
      .insert({
        grid_import_kw: Number(gridImport.toFixed(2)),
        grid_export_kw: Number(gridExport.toFixed(2)),
        grid_frequency: Number((50 + (Math.random() - 0.5) * 0.2).toFixed(2)), // 49.9-50.1 Hz
        voltage_l1: Number((230 + (Math.random() - 0.5) * 10).toFixed(2)), // 225-235V
        voltage_l2: Number((230 + (Math.random() - 0.5) * 10).toFixed(2)),
        voltage_l3: Number((230 + (Math.random() - 0.5) * 10).toFixed(2))
      });

    if (gridError) console.error('Grid data insert error:', gridError);

    // Calculate energy mix percentages
    const totalGen = solarPowerGenerated + windPowerGenerated + Math.abs(chargeRate < 0 ? chargeRate : 0) + gridImport;
    
    const energyMix = {
      solar_percentage: totalGen > 0 ? Number((solarPowerGenerated / totalGen * 100).toFixed(2)) : 0,
      wind_percentage: totalGen > 0 ? Number((windPowerGenerated / totalGen * 100).toFixed(2)) : 0,
      battery_percentage: totalGen > 0 ? Number((Math.abs(chargeRate < 0 ? chargeRate : 0) / totalGen * 100).toFixed(2)) : 0,
      grid_percentage: totalGen > 0 ? Number((gridImport / totalGen * 100).toFixed(2)) : 0,
      total_generation_kw: Number(totalGeneration.toFixed(2)),
      total_consumption_kw: Number(campusLoad.toFixed(2)),
      self_consumption_percentage: Number((Math.min(totalGeneration, campusLoad) / campusLoad * 100).toFixed(2))
    };

    // Insert energy mix
    const { error: mixError } = await supabaseClient
      .from('energy_mix')
      .insert(energyMix);

    if (mixError) console.error('Energy mix insert error:', mixError);

    // Generate smart alerts based on conditions
    const alerts = [];
    
    if (currentSoC < 30) {
      alerts.push({
        alert_type: 'warning',
        category: 'battery',
        title: 'Low Battery Level',
        description: `Battery SoC is ${currentSoC.toFixed(1)}%, below recommended minimum`,
        recommendation: 'Consider reducing non-critical loads or importing from grid',
        priority: 3
      });
    }

    if (solarPowerGenerated > 400 && currentSoC < 80) {
      alerts.push({
        alert_type: 'success',
        category: 'optimization',
        title: 'Optimal Solar Generation',
        description: `Excellent solar conditions generating ${solarPowerGenerated.toFixed(0)}kW`,
        recommendation: 'Perfect time to charge batteries and run flexible loads',
        priority: 2
      });
    }

    if (windPowerGenerated > 150) {
      alerts.push({
        alert_type: 'info',
        category: 'wind',
        title: 'Strong Wind Generation',
        description: `Wind turbines generating ${windPowerGenerated.toFixed(0)}kW at ${baseWindSpeed.toFixed(1)} m/s`,
        recommendation: 'Excellent conditions for renewable energy harvest',
        priority: 1
      });
    }

    if (gridImport > 200) {
      alerts.push({
        alert_type: 'warning',
        category: 'grid',
        title: 'High Grid Import',
        description: `Currently importing ${gridImport.toFixed(0)}kW from grid`,
        recommendation: 'Consider load shifting or battery discharge if available',
        priority: 3
      });
    }

    // Insert alerts
    if (alerts.length > 0) {
      const { error: alertsError } = await supabaseClient
        .from('energy_alerts')
        .insert(alerts);

      if (alertsError) console.error('Alerts insert error:', alertsError);
    }

    const responseData = {
      success: true,
      timestamp: now.toISOString(),
      data: {
        solar: { irradiance: solarIrradiance, power: solarPowerGenerated },
        wind: { speed: baseWindSpeed, power: windPowerGenerated },
        battery: { soc: currentSoC, chargeRate: chargeRate },
        campus: { load: campusLoad },
        grid: { import: gridImport, export: gridExport },
        energyMix,
        alerts: alerts.length
      }
    };

    console.log('Successfully generated and stored energy data:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-weather-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});