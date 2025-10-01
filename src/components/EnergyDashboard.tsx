import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnergyData } from '@/hooks/useEnergyData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CampusLoadInput } from './CampusLoadInput';
import { EnergyFlowDiagram } from './EnergyFlowDiagram';
import { RefreshCw, Loader2, CheckCircle, Info, Gauge, PlayCircle, StopCircle } from 'lucide-react';

export const EnergyDashboard = () => {
  const { energyData, alerts, loading, error, autoUpdate, setAutoUpdate, generateNewData, refreshData } = useEnergyData();
  const { toast } = useToast();
  const [aiResult, setAiResult] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIOptimization = async () => {
    try {
      setIsGenerating(true);
      const { data: functionData, error: functionError } = await supabase.functions.invoke('energy-ai-forecast', {
        body: { type: 'optimize' }
      });

      if (functionError) throw functionError;

      setAiResult(functionData.forecast || 'No recommendations available');
      toast({
        title: "AI Optimization Complete",
        description: "Energy optimization recommendations generated",
      });
    } catch (error) {
      console.error('Error calling AI optimization:', error);
      toast({
        title: "AI Optimization Failed",
        description: error instanceof Error ? error.message : "Could not generate optimization recommendations",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIForecast = async () => {
    try {
      setIsGenerating(true);
      const { data: functionData, error: functionError } = await supabase.functions.invoke('energy-ai-forecast', {
        body: { type: 'forecast' }
      });

      if (functionError) throw functionError;

      setAiResult(functionData.forecast || 'No forecast available');
      toast({
        title: "AI Forecast Complete",
        description: "24-hour energy forecast generated",
      });
    } catch (error) {
      console.error('Error calling AI forecast:', error);
      toast({
        title: "AI Forecast Failed",
        description: error instanceof Error ? error.message : "Could not generate energy forecast",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsGenerating(true);
    await generateNewData();
    setIsGenerating(false);
  };

  if (loading && !energyData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading energy data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
        </div>
      </div>
    );
  }

  if (!energyData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No energy data available</p>
          <Button onClick={generateNewData}>
            Generate Initial Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Energy Management Dashboard</h1>
          <p className="text-gray-600">Real-time renewable energy monitoring with intelligent flow management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setAutoUpdate(!autoUpdate)} 
            variant={autoUpdate ? "default" : "outline"}
          >
            {autoUpdate ? (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Auto-Update
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Auto-Update
              </>
            )}
          </Button>
          <Button onClick={handleManualRefresh} variant="outline" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Data
              </>
            )}
          </Button>
          <Button onClick={handleAIOptimization} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            AI Optimization
          </Button>
          <Button onClick={handleAIForecast} variant="secondary" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            AI Forecast
          </Button>
        </div>
      </div>

      {/* Campus Load Input */}
      <CampusLoadInput 
        currentLoad={energyData.campus.totalLoad}
        targetLoad={energyData.campus.targetLoad}
      />

      {/* Energy Flow Diagram */}
      <EnergyFlowDiagram
        solarPower={energyData.solar.current}
        windPower={energyData.wind.current}
        batteryCharge={energyData.battery.chargeRate}
        batterySOC={energyData.battery.soc}
        campusLoad={energyData.campus.totalLoad}
        gridImport={energyData.grid.import}
        gridExport={energyData.grid.export}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solar Power</CardTitle>
            <div className="text-2xl">☀️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData.solar.current.toFixed(1)} kW</div>
            <p className="text-xs text-muted-foreground">
              Irradiance: {energyData.solar.irradiance.toFixed(0)} W/m²
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Power</CardTitle>
            <div className="text-2xl">💨</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData.wind.current.toFixed(1)} kW</div>
            <p className="text-xs text-muted-foreground">
              Speed: {energyData.wind.speed.toFixed(1)} m/s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery</CardTitle>
            <div className="text-2xl">🔋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyData.battery.soc.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {energyData.battery.chargeRate > 0 ? 'Charging' : energyData.battery.chargeRate < 0 ? 'Discharging' : 'Idle'}: {Math.abs(energyData.battery.chargeRate).toFixed(1)} kW
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grid Status</CardTitle>
            <div className="text-2xl">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {energyData.grid.import > 0 ? `+${energyData.grid.import.toFixed(1)}` : 
               energyData.grid.export > 0 ? `-${energyData.grid.export.toFixed(1)}` : '0.0'} kW
            </div>
            <p className="text-xs text-muted-foreground">
              {energyData.grid.import > 0 ? 'Importing' : energyData.grid.export > 0 ? 'Exporting' : 'Balanced'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Energy Mix */}
      <Card>
        <CardHeader>
          <CardTitle>Current Energy Mix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{energyData.mix.solar.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Solar</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{energyData.mix.wind.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Wind</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{energyData.mix.battery.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Battery</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{energyData.mix.grid.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Grid</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Badge variant="secondary">
              Self-consumption: {energyData.mix.selfConsumption.toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Live Alerts & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Live Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>All systems operating normally</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'success' ? 'bg-green-50 border-green-500' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      {alert.recommendation && (
                        <p className="text-sm font-medium mt-2 text-blue-700">
                          💡 {alert.recommendation}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {alert.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Results */}
      {aiResult && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{aiResult}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};