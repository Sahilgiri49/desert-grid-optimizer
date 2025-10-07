import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Battery, Zap } from 'lucide-react';

interface AIOptimizationData {
  forecast: string;
  data: {
    recommendations?: Array<{
      category: string;
      priority: string;
      action: string;
      impact: string;
    }>;
    hourlyForecast?: Array<{
      hour: number;
      solar: number;
      wind: number;
      load: number;
      batteryAction: string;
    }>;
  };
  currentConditions: {
    solar: { solar_power_generated: number; solar_irradiance: number };
    wind: { wind_power_generated: number; wind_speed: number };
    battery: { state_of_charge: number; charge_rate: number };
    load: { total_load_kw: number };
    grid: { grid_import_kw: number; grid_export_kw: number };
  };
}

interface AIOptimizationResultsProps {
  data: AIOptimizationData;
  type: 'optimize' | 'forecast';
}

const COLORS = {
  solar: 'hsl(var(--chart-1))',
  wind: 'hsl(var(--chart-2))',
  battery: 'hsl(var(--chart-3))',
  load: 'hsl(var(--chart-4))',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

export const AIOptimizationResults: React.FC<AIOptimizationResultsProps> = ({ data, type }) => {
  const currentConditions = data.currentConditions;

  // Prepare current status chart data
  const currentStatusData = [
    { name: 'Solar', value: currentConditions.solar?.solar_power_generated || 0, color: COLORS.solar },
    { name: 'Wind', value: currentConditions.wind?.wind_power_generated || 0, color: COLORS.wind },
    { name: 'Grid Import', value: currentConditions.grid?.grid_import_kw || 0, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  const totalGeneration = currentStatusData.reduce((sum, item) => sum + item.value, 0);
  const loadDemand = currentConditions.load?.total_load_kw || 0;

  // Energy balance data for bar chart
  const energyBalanceData = [{
    name: 'Current',
    Generation: totalGeneration,
    Demand: loadDemand,
    Battery: Math.abs(currentConditions.battery?.charge_rate || 0)
  }];

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-500';
      case 'medium':
        return 'bg-yellow-50 border-yellow-500';
      default:
        return 'bg-green-50 border-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI {type === 'optimize' ? 'Optimization' : 'Forecast'} Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/10 p-4 rounded-lg">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{data.forecast}</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Energy Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Current Energy Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart - Generation Mix */}
            <div>
              <h4 className="text-sm font-medium mb-4">Generation Sources</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={currentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Energy Balance */}
            <div>
              <h4 className="text-sm font-medium mb-4">Energy Balance (kW)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={energyBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Generation" fill={COLORS.solar} />
                  <Bar dataKey="Demand" fill={COLORS.load} />
                  <Bar dataKey="Battery" fill={COLORS.battery} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold">{totalGeneration.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Total Generation (kW)</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold">{loadDemand.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Load Demand (kW)</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold">{currentConditions.battery?.state_of_charge?.toFixed(1) || 0}%</div>
              <div className="text-xs text-muted-foreground">Battery SoC</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold">
                {((totalGeneration / loadDemand) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Self-Sufficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      {type === 'optimize' && data.data.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getPriorityIcon(rec.priority)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{rec.action}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Impact: <span className="font-medium">{rec.impact}</span>
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`ml-4 ${
                        rec.priority.toLowerCase() === 'high' ? 'border-red-500 text-red-700' :
                        rec.priority.toLowerCase() === 'medium' ? 'border-yellow-500 text-yellow-700' :
                        'border-green-500 text-green-700'
                      }`}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Chart */}
      {type === 'forecast' && data.data.hourlyForecast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              24-Hour Energy Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.data.hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="solar" 
                  stroke={COLORS.solar} 
                  strokeWidth={2}
                  name="Solar (kW)"
                />
                <Line 
                  type="monotone" 
                  dataKey="wind" 
                  stroke={COLORS.wind} 
                  strokeWidth={2}
                  name="Wind (kW)"
                />
                <Line 
                  type="monotone" 
                  dataKey="load" 
                  stroke={COLORS.load} 
                  strokeWidth={2}
                  name="Load (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
