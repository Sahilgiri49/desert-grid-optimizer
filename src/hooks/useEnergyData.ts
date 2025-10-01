import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnergyData {
  solar: {
    current: number;
    forecast: number;
    irradiance: number;
    efficiency: number;
  };
  wind: {
    current: number;
    forecast: number;
    speed: number;
    direction: number;
  };
  battery: {
    soc: number;
    chargeRate: number;
    capacity: number;
    health: number;
  };
  campus: {
    totalLoad: number;
    hvacLoad: number;
    lightingLoad: number;
    equipmentLoad: number;
    forecast: number;
    targetLoad: number;
  };
  grid: {
    import: number;
    export: number;
    frequency: number;
  };
  mix: {
    solar: number;
    wind: number;
    battery: number;
    grid: number;
    selfConsumption: number;
  };
}

export interface EnergyAlert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  category: string;
  title: string;
  description: string;
  recommendation?: string;
  priority: number;
  timestamp: string;
}

export const useEnergyData = () => {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [alerts, setAlerts] = useState<EnergyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const { toast } = useToast();

  const fetchLatestData = async () => {
    try {
      // Fetch latest data from all tables
      const [solarResult, windResult, batteryResult, campusResult, gridResult, mixResult, alertsResult] = await Promise.all([
        supabase.from('solar_data').select('*').order('timestamp', { ascending: false }).limit(1).single(),
        supabase.from('wind_data').select('*').order('timestamp', { ascending: false }).limit(1).single(),
        supabase.from('battery_data').select('*').order('timestamp', { ascending: false }).limit(1).single(),
        supabase.from('campus_load_data').select('*').order('timestamp', { ascending: false }).limit(1).single(),
        supabase.from('grid_data').select('*').order('timestamp', { ascending: false }).limit(1).single(),
        supabase.from('energy_mix').select('*').order('timestamp', { ascending: false }).limit(1).single(),
        supabase.from('energy_alerts').select('*').eq('is_active', true).order('priority', { ascending: false }).limit(10)
      ]);

      // Handle cases where no data exists yet
      const solarData = solarResult.data || {
        solar_power_generated: 0,
        solar_power_forecast: 0,
        solar_irradiance: 0,
        temperature_celsius: 25
      };

      const windData = windResult.data || {
        wind_power_generated: 0,
        wind_power_forecast: 0,
        wind_speed: 0,
        wind_direction: 0
      };

      const batteryData = batteryResult.data || {
        state_of_charge: 50,
        charge_rate: 0,
        capacity_kwh: 1000,
        health_percentage: 95
      };

      const campusData = campusResult.data || {
        total_load_kw: 300,
        hvac_load_kw: 120,
        lighting_load_kw: 60,
        equipment_load_kw: 90,
        load_forecast_kw: 310,
        target_load_kw: 300
      };

      const gridData = gridResult.data || {
        grid_import_kw: 0,
        grid_export_kw: 0,
        grid_frequency: 50
      };

      const mixData = mixResult.data || {
        solar_percentage: 0,
        wind_percentage: 0,
        battery_percentage: 0,
        grid_percentage: 100,
        self_consumption_percentage: 0
      };

      // Transform data to match interface
      const transformedData: EnergyData = {
        solar: {
          current: solarData.solar_power_generated || 0,
          forecast: solarData.solar_power_forecast || 0,
          irradiance: solarData.solar_irradiance || 0,
          efficiency: solarData.solar_irradiance > 0 ? ((solarData.solar_power_generated || 0) / (solarData.solar_irradiance * 0.5)) * 100 : 0
        },
        wind: {
          current: windData.wind_power_generated || 0,
          forecast: windData.wind_power_forecast || 0,
          speed: windData.wind_speed || 0,
          direction: windData.wind_direction || 0
        },
        battery: {
          soc: batteryData.state_of_charge || 0,
          chargeRate: batteryData.charge_rate || 0,
          capacity: batteryData.capacity_kwh || 1000,
          health: batteryData.health_percentage || 95
        },
        campus: {
          totalLoad: campusData.total_load_kw || 0,
          hvacLoad: campusData.hvac_load_kw || 0,
          lightingLoad: campusData.lighting_load_kw || 0,
          equipmentLoad: campusData.equipment_load_kw || 0,
          forecast: campusData.load_forecast_kw || 0,
          targetLoad: campusData.target_load_kw || 300
        },
        grid: {
          import: gridData.grid_import_kw || 0,
          export: gridData.grid_export_kw || 0,
          frequency: gridData.grid_frequency || 50
        },
        mix: {
          solar: mixData.solar_percentage || 0,
          wind: mixData.wind_percentage || 0,
          battery: mixData.battery_percentage || 0,
          grid: mixData.grid_percentage || 0,
          selfConsumption: mixData.self_consumption_percentage || 0
        }
      };

      setEnergyData(transformedData);

      // Transform alerts
      const transformedAlerts: EnergyAlert[] = (alertsResult.data || []).map(alert => ({
        id: alert.id,
        type: alert.alert_type as 'info' | 'warning' | 'critical' | 'success',
        category: alert.category,
        title: alert.title,
        description: alert.description,
        recommendation: alert.recommendation,
        priority: alert.priority,
        timestamp: alert.timestamp
      }));

      setAlerts(transformedAlerts);
      setError(null);

    } catch (err) {
      console.error('Error fetching energy data:', err);
      setError('Failed to fetch energy data');
      toast({
        title: "Data Fetch Error",
        description: "Unable to load latest energy data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewData = async () => {
    try {
      console.log('Triggering data generation...');
      const response = await supabase.functions.invoke('fetch-weather-data', {
        body: {}
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Data Updated",
        description: "New energy data has been generated",
      });

      // Fetch updated data
      await fetchLatestData();

    } catch (err) {
      console.error('Error generating data:', err);
      toast({
        title: "Generation Error",
        description: "Failed to generate new data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLatestData();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('solar_changes').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'solar_data' }, 
        () => fetchLatestData()
      ).subscribe(),

      supabase.channel('wind_changes').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wind_data' }, 
        () => fetchLatestData()
      ).subscribe(),

      supabase.channel('battery_changes').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'battery_data' }, 
        () => fetchLatestData()
      ).subscribe(),

      supabase.channel('campus_changes').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'campus_load_data' }, 
        () => fetchLatestData()
      ).subscribe(),

      supabase.channel('grid_changes').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'grid_data' }, 
        () => fetchLatestData()
      ).subscribe(),

      supabase.channel('alerts_changes').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'energy_alerts' }, 
        () => fetchLatestData()
      ).subscribe(),
    ];

    // Auto-generate data every 3 seconds for real-time effect (only if autoUpdate is true)
    const interval = autoUpdate ? setInterval(() => {
      generateNewData();
    }, 3000) : null;

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      if (interval) clearInterval(interval);
    };
  }, [autoUpdate]);

  return {
    energyData,
    alerts,
    loading,
    error,
    autoUpdate,
    setAutoUpdate,
    generateNewData,
    refreshData: fetchLatestData
  };
};
