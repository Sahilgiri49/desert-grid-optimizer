import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Sun, Wind, Battery, Zap, TrendingUp, AlertTriangle, Settings, Download } from "lucide-react";
import heroImage from "@/assets/renewable-energy-hero.jpg";

// Mock data for demonstration
const solarData = [
  { time: '06:00', power: 0, forecast: 0 },
  { time: '08:00', power: 2.5, forecast: 3.1 },
  { time: '10:00', power: 8.2, forecast: 8.9 },
  { time: '12:00', power: 15.3, forecast: 14.8 },
  { time: '14:00', power: 18.7, forecast: 17.9 },
  { time: '16:00', power: 12.4, forecast: 11.8 },
  { time: '18:00', power: 5.1, forecast: 4.9 },
  { time: '20:00', power: 0, forecast: 0 },
];

const windData = [
  { time: '06:00', power: 3.2, speed: 12 },
  { time: '08:00', power: 4.1, speed: 15 },
  { time: '10:00', power: 2.8, speed: 10 },
  { time: '12:00', power: 1.9, speed: 8 },
  { time: '14:00', power: 3.5, speed: 13 },
  { time: '16:00', power: 5.2, speed: 18 },
  { time: '18:00', power: 6.1, speed: 21 },
  { time: '20:00', power: 4.8, speed: 16 },
];

const energyMix = [
  { name: 'Solar', value: 45, color: '#F59E0B' },
  { name: 'Wind', value: 30, color: '#3B82F6' },
  { name: 'Battery', value: 15, color: '#10B981' },
  { name: 'Grid', value: 10, color: '#6B7280' },
];

export const EnergyDashboard = () => {
  const currentTime = new Date().toLocaleTimeString();
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-75"></div>
          <div className="relative z-10 flex h-full items-center justify-center text-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Rajasthan Campus Energy Management
              </h1>
              <p className="text-xl text-white/90">
                Hybrid Renewable Energy Generation Solution
              </p>
              <Badge variant="secondary" className="mt-4">
                Last Updated: {currentTime}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover:shadow-strong transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generation</CardTitle>
              <Sun className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.7 kW</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battery Status</CardTitle>
              <Battery className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <Progress value={78} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Charging • 2.5 kW
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grid Dependency</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18%</div>
              <p className="text-xs text-muted-foreground">
                -65% reduction this month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-strong transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campus Load</CardTitle>
              <Settings className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">19.8 kW</div>
              <p className="text-xs text-muted-foreground">
                Peak: 24.2 kW at 14:30
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="solar">Solar</TabsTrigger>
            <TabsTrigger value="wind">Wind</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Energy Mix Chart */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Energy Mix Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={energyMix}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {energyMix.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {energyMix.map((item) => (
                      <div key={item.name} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts & Recommendations */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Alerts & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-success/10 rounded-lg border-l-4 border-success">
                    <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-success">Optimal Solar Conditions</p>
                      <p className="text-sm text-muted-foreground">
                        Peak solar generation expected 12:00-15:00. Consider shifting high-load operations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-warning/10 rounded-lg border-l-4 border-warning">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-warning">Battery Optimization</p>
                      <p className="text-sm text-muted-foreground">
                        Start battery charging at 11:00 AM to maximize solar utilization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-secondary/10 rounded-lg border-l-4 border-secondary">
                    <Wind className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary">Wind Forecast</p>
                      <p className="text-sm text-muted-foreground">
                        Strong wind expected after 16:00. Wind generation will peak at 18:00.
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Alert Thresholds
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="solar" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Solar Power Generation & Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={solarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="power" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      name="Current Generation"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wind" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Wind Power Generation & Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={windData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Speed (m/s)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="power" fill="hsl(var(--secondary))" name="Wind Power (kW)" />
                    <Line yAxisId="right" type="monotone" dataKey="speed" stroke="hsl(var(--primary))" name="Wind Speed (m/s)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Battery Schedule */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Battery Optimization Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <div>
                        <p className="font-medium">Charge Window</p>
                        <p className="text-sm text-muted-foreground">11:00 - 15:00</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Discharge Window</p>
                        <p className="text-sm text-muted-foreground">18:00 - 22:00</p>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  </div>

                  <Button className="w-full">
                    Update Schedule
                  </Button>
                </CardContent>
              </Card>

              {/* Load Shifting Recommendations */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Load Shifting Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">HVAC Systems</p>
                          <p className="text-sm text-muted-foreground">Shift cooling load to 12:00-14:00</p>
                        </div>
                        <Badge>2.5 kW</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Workshop Equipment</p>
                          <p className="text-sm text-muted-foreground">Schedule for 13:00-16:00 window</p>
                        </div>
                        <Badge>1.8 kW</Badge>
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Water Heating</p>
                          <p className="text-sm text-muted-foreground">Optimize for solar peak hours</p>
                        </div>
                        <Badge>3.2 kW</Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Apply Recommendations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Controls */}
        <Card className="shadow-soft mt-8">
          <CardHeader>
            <CardTitle>Data Export & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Daily Report
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Monthly Analytics
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Carbon Footprint Summary
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Cost Savings Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};