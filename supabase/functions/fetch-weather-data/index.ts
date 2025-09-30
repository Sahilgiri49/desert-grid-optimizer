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

    // Get current target load from database
    const { data: currentLoadData } = await supabaseClient
      .from('campus_load_data')
      .select('target_load_kw')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    const targetCampusLoad = currentLoadData?.target_load_kw || 300;

    // Generate realistic solar data based on time of day
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Add second-level variations for dynamic updates
    const timeVariation = (seconds / 60) * 0.1; // 10% variation within each minute
    
    // Solar irradiance simulation (peak at noon, zero at night)
    let solarIrradiance = 0;
    if (hour >= 6 && hour <= 18) {
      const solarAngle = ((hour - 6) + minute / 60) / 12; // 0 to 1 from 6AM to 6PM
      solarIrradiance = Math.sin(solarAngle * Math.PI) * 1000; // Peak 1000 W/m²
      // Add randomness and second-level variations
      solarIrradiance *= (0.8 + Math.random() * 0.4 + timeVariation); // Dynamic variation
    }

    // Solar power generation (assuming 500kW installation capacity)
    const solarPowerGenerated = (solarIrradiance / 1000) * 500 * (0.85 + Math.random() * 0.15 + timeVariation);

    // Wind simulation (varies throughout day with some randomness)
    const baseWindSpeed = 3 + Math.sin((hour + minute/60 + seconds/3600) * Math.PI / 12) * 4 + Math.random() * 3; // 0-10 m/s
    const windDirection = Math.random() * 360;
    
    // Wind power generation (assuming 200kW wind capacity, cut-in at 3 m/s)
    let windPowerGenerated = 0;
    if (baseWindSpeed > 3) {
      windPowerGenerated = Math.min((baseWindSpeed - 3) / 12 * 200, 200) * (0.7 + Math.random() * 0.3 + timeVariation);
    }

    // INTELLIGENT ENERGY FLOW LOGIC
    const totalRenewableGeneration = solarPowerGenerated + windPowerGenerated;
    
    // Step 1: Renewables power the campus load first
    const renewableToLoad = Math.min(totalRenewableGeneration, targetCampusLoad);
    const excessRenewable = Math.max(0, totalRenewableGeneration - targetCampusLoad);
    const renewableDeficit = Math.max(0, targetCampusLoad - totalRenewableGeneration);
    
    // Get current battery state
    const { data: currentBatteryData } = await supabaseClient
      .from('battery_data')
      .select('state_of_charge')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    const currentSoC = currentBatteryData?.state_of_charge || 50;
    const batteryCapacity = 1000; // 1 MWh
    
    let chargeRate = 0;
    let gridImport = 0;
    let gridExport = 0;
    
    // Step 2: Handle excess renewable energy
    if (excessRenewable > 0) {
      if (currentSoC < 90) {
        // Charge battery with excess
        chargeRate = Math.min(excessRenewable * 0.9, 200, (90 - currentSoC) * 10); // Limit charge rate
        const remainingExcess = Math.max(0, excessRenewable - chargeRate);
        
        // Export remaining excess to grid
        if (remainingExcess > 0) {
          gridExport = remainingExcess;
        }
      } else {
        // Battery full, export all excess to grid
        gridExport = excessRenewable;
      }
    }
    
    // Step 3: Handle renewable deficit
    if (renewableDeficit > 0) {
      if (currentSoC > 25) {
        // Discharge battery to cover deficit
        const maxDischarge = Math.min(renewableDeficit, 150, (currentSoC - 20) * 10); // Limit discharge
        chargeRate = -maxDischarge;
        const remainingDeficit = Math.max(0, renewableDeficit - maxDischarge);
        
        // Import remaining deficit from grid
        if (remainingDeficit > 0) {
          gridImport = remainingDeficit;
        }
      } else {
        // Battery low, import all deficit from grid
        gridImport = renewableDeficit;
      }
    }
    
    // Update battery SoC based on charge/discharge
    const socChange = (chargeRate / batteryCapacity) * 100 / 60; // Per minute change
    const newSoC = Math.max(20, Math.min(95, currentSoC + socChange));

    // Actual campus load varies slightly around target
    const actualCampusLoad = targetCampusLoad + (Math.random() - 0.5) * 20 + timeVariation * 10;

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
        state_of_charge: Number(newSoC.toFixed(2)),
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
        total_load_kw: Number(actualCampusLoad.toFixed(2)),
        hvac_load_kw: Number((actualCampusLoad * 0.4).toFixed(2)),
        lighting_load_kw: Number((actualCampusLoad * 0.2).toFixed(2)),
        equipment_load_kw: Number((actualCampusLoad * 0.3).toFixed(2)),
        other_load_kw: Number((actualCampusLoad * 0.1).toFixed(2)),
        load_forecast_kw: Number((actualCampusLoad * 1.03).toFixed(2)), // 3% forecast increase
        target_load_kw: Number(targetCampusLoad.toFixed(2))
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
    const totalSupply = totalRenewableGeneration + Math.abs(chargeRate < 0 ? chargeRate : 0) + gridImport;
    
    const energyMix = {
      solar_percentage: totalSupply > 0 ? Number((solarPowerGenerated / totalSupply * 100).toFixed(2)) : 0,
      wind_percentage: totalSupply > 0 ? Number((windPowerGenerated / totalSupply * 100).toFixed(2)) : 0,
      battery_percentage: totalSupply > 0 ? Number((Math.abs(chargeRate < 0 ? chargeRate : 0) / totalSupply * 100).toFixed(2)) : 0,
      grid_percentage: totalSupply > 0 ? Number((gridImport / totalSupply * 100).toFixed(2)) : 0,
      total_generation_kw: Number(totalRenewableGeneration.toFixed(2)),
      total_consumption_kw: Number(actualCampusLoad.toFixed(2)),
      self_consumption_percentage: Number((Math.min(totalRenewableGeneration, actualCampusLoad) / actualCampusLoad * 100).toFixed(2))
    };

    // Insert energy mix
    const { error: mixError } = await supabaseClient
      .from('energy_mix')
      .insert(energyMix);

    if (mixError) console.error('Energy mix insert error:', mixError);

    // Deactivate old alerts
    await supabaseClient
      .from('energy_alerts')
      .update({ is_active: false })
      .eq('is_active', true);

    // Generate smart alerts based on conditions
    const alerts = [];
    
    if (newSoC < 30) {
      alerts.push({
        alert_type: 'warning',
        category: 'battery',
        title: 'Low Battery Level',
        description: `Battery SoC is ${newSoC.toFixed(1)}%, below recommended minimum`,
        recommendation: 'Consider reducing non-critical loads or importing from grid',
        priority: 3
      });
    }

    if (solarPowerGenerated > 400 && newSoC < 80) {
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

    if (gridExport > 100) {
      alerts.push({
        alert_type: 'success',
        category: 'grid',
        title: 'Exporting to Grid',
        description: `Exporting ${gridExport.toFixed(0)}kW surplus renewable energy`,
        recommendation: 'Great! You are contributing clean energy to the grid',
        priority: 1
      });
    }

    if (totalRenewableGeneration >= actualCampusLoad) {
      alerts.push({
        alert_type: 'success',
        category: 'energy',
        title: '100% Renewable Coverage',
        description: `Campus fully powered by renewables with ${(totalRenewableGeneration - actualCampusLoad).toFixed(0)}kW surplus`,
        recommendation: 'Excellent renewable energy performance',
        priority: 1
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
        battery: { soc: newSoC, chargeRate: chargeRate },
        campus: { load: actualCampusLoad, target: targetCampusLoad },
        grid: { import: gridImport, export: gridExport },
        energyMix,
        alerts: alerts.length,
        energyFlow: {
          renewableToLoad,
          excessRenewable,
          renewableDeficit,
          totalRenewable: totalRenewableGeneration
        }
      }
    };

    console.log('Successfully generated and stored energy data:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-weather-data function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});