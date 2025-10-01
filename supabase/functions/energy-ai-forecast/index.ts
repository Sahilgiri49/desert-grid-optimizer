import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { timeframe = '24h', type = 'optimization' } = await req.json().catch(() => ({}));

    console.log(`Generating AI forecast for ${timeframe}, type: ${type}`);

    // Fetch recent energy data for analysis
    const [solarData, windData, batteryData, loadData, gridData] = await Promise.all([
      supabaseClient
        .from('solar_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24),
      supabaseClient
        .from('wind_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24),
      supabaseClient
        .from('battery_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24),
      supabaseClient
        .from('campus_load_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24),
      supabaseClient
        .from('grid_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24)
    ]);

    // Prepare data summary for AI analysis
    const currentData = {
      solar: solarData.data?.[0] || {},
      wind: windData.data?.[0] || {},
      battery: batteryData.data?.[0] || {},
      load: loadData.data?.[0] || {},
      grid: gridData.data?.[0] || {}
    };

    const recentTrends = {
      avgSolarPower: solarData.data?.reduce((sum, d) => sum + (d.solar_power_generated || 0), 0) / (solarData.data?.length || 1),
      avgWindPower: windData.data?.reduce((sum, d) => sum + (d.wind_power_generated || 0), 0) / (windData.data?.length || 1),
      avgBatterySoC: batteryData.data?.reduce((sum, d) => sum + (d.state_of_charge || 0), 0) / (batteryData.data?.length || 1),
      avgLoad: loadData.data?.reduce((sum, d) => sum + (d.total_load_kw || 0), 0) / (loadData.data?.length || 1)
    };

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'optimize') {
      systemPrompt = `You are an AI energy optimization expert for a renewable energy campus in Rajasthan, India. 
      Analyze the current energy data and provide actionable optimization recommendations.
      Focus on maximizing renewable energy utilization, optimizing battery usage, and minimizing grid dependency.
      Consider local conditions: high solar potential, moderate wind, hot climate, and typical campus load patterns.`;

      userPrompt = `Current Energy Status:
      - Solar: ${currentData.solar.solar_power_generated || 0}kW generated, ${currentData.solar.solar_irradiance || 0}W/m² irradiance
      - Wind: ${currentData.wind.wind_power_generated || 0}kW generated, ${currentData.wind.wind_speed || 0}m/s speed  
      - Battery: ${currentData.battery.state_of_charge || 0}% SoC, ${currentData.battery.charge_rate || 0}kW charge rate
      - Campus Load: ${currentData.load.total_load_kw || 0}kW total demand
      - Grid: ${currentData.grid.grid_import_kw || 0}kW import, ${currentData.grid.grid_export_kw || 0}kW export

      Recent 24h Trends:
      - Average Solar: ${recentTrends.avgSolarPower.toFixed(1)}kW
      - Average Wind: ${recentTrends.avgWindPower.toFixed(1)}kW
      - Average Battery SoC: ${recentTrends.avgBatterySoC.toFixed(1)}%
      - Average Load: ${recentTrends.avgLoad.toFixed(1)}kW

      Provide specific optimization recommendations for the next ${timeframe}.`;

    } else if (type === 'forecast') {
      systemPrompt = `You are an AI energy forecasting specialist for a renewable campus in Rajasthan.
      Predict energy generation, consumption, and optimal strategies based on historical patterns and current conditions.
      Consider typical daily cycles, seasonal patterns, and weather impact on renewable generation.`;

      userPrompt = `Based on current conditions and recent trends, forecast energy patterns for the next ${timeframe}:
      
      Current Status: Solar ${currentData.solar.solar_power_generated || 0}kW, Wind ${currentData.wind.wind_power_generated || 0}kW, 
      Battery ${currentData.battery.state_of_charge || 0}% SoC, Load ${currentData.load.total_load_kw || 0}kW

      Provide hourly predictions and key insights for energy planning.`;
    }

    // Call Lovable AI with correct format
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const forecast = aiResult.choices[0].message.content;

    // Generate structured forecast data based on type
    let structuredData = {};

    if (type === 'optimization') {
      // Extract key recommendations and create actionable items
      structuredData = {
        recommendations: [
          {
            category: 'battery',
            priority: currentData.battery.state_of_charge < 50 ? 'high' : 'medium',
            action: currentData.battery.state_of_charge < 30 ? 'Charge battery urgently' : 'Optimize charging schedule',
            impact: 'High'
          },
          {
            category: 'solar',
            priority: (currentData.solar.solar_power_generated || 0) > 300 ? 'high' : 'low',
            action: (currentData.solar.solar_power_generated || 0) > 300 ? 'Maximize solar utilization' : 'Wait for better conditions',
            impact: 'Medium'
          }
        ],
        nextActions: [
          `Monitor battery SoC (currently ${currentData.battery.state_of_charge || 0}%)`,
          `Optimize HVAC schedule based on solar availability`,
          `Consider load shifting for non-critical equipment`
        ]
      };
    } else if (type === 'forecast') {
      // Generate hourly forecast for next 6-24 hours
      const hoursToForecast = timeframe === '6h' ? 6 : 24;
      const hourlyForecast = [];
      
      for (let i = 1; i <= hoursToForecast; i++) {
        const hour = (new Date().getHours() + i) % 24;
        
        // Simple forecast based on typical daily patterns
        let solarForecast = 0;
        if (hour >= 6 && hour <= 18) {
          const solarAngle = ((hour - 6)) / 12;
          solarForecast = Math.sin(solarAngle * Math.PI) * 450; // Peak ~450kW
        }
        
        const windForecast = 50 + Math.sin(hour * Math.PI / 12) * 100; // 0-150kW
        const loadForecast = 250 + Math.sin((hour - 8) * Math.PI / 16) * 200; // 50-450kW
        
        hourlyForecast.push({
          hour: hour,
          solar: Math.round(solarForecast),
          wind: Math.round(windForecast),
          load: Math.round(loadForecast),
          batteryAction: solarForecast > loadForecast ? 'charge' : 'discharge'
        });
      }
      
      structuredData = { hourlyForecast };
    }

    const response = {
      success: true,
      type,
      timeframe,
      timestamp: new Date().toISOString(),
      forecast,
      data: structuredData,
      currentConditions: currentData
    };

    console.log('AI forecast generated successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in energy-ai-forecast function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});