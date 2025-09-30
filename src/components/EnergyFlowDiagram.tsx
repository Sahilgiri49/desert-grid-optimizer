import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Wind, Battery, Home, Zap, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';

interface EnergyFlowDiagramProps {
  solarPower: number;
  windPower: number;
  batteryCharge: number;
  batterySOC: number;
  campusLoad: number;
  gridImport: number;
  gridExport: number;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({
  solarPower,
  windPower,
  batteryCharge,
  batterySOC,
  campusLoad,
  gridImport,
  gridExport,
}) => {
  const totalRenewable = solarPower + windPower;
  const isCharging = batteryCharge > 0;
  const isDischarging = batteryCharge < 0;
  const isExporting = gridExport > 0;
  const isImporting = gridImport > 0;

  const FlowArrow: React.FC<{ 
    power: number; 
    direction: 'right' | 'down' | 'up'; 
    color?: string;
  }> = ({ power, direction, color = "text-primary" }) => {
    if (power <= 0) return null;
    
    const ArrowComponent = direction === 'right' ? ArrowRight : direction === 'down' ? ArrowDown : ArrowUp;
    
    return (
      <div className={`flex items-center ${color} animate-pulse`}>
        <ArrowComponent className="h-4 w-4" />
        <span className="text-xs ml-1">{power.toFixed(0)}kW</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Real-time Energy Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-6 h-80">
          {/* Solar Generation */}
          <div className="flex flex-col items-center justify-start space-y-2">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Sun className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{solarPower.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Solar kW</div>
            </div>
            <FlowArrow power={solarPower} direction="down" color="text-yellow-600" />
          </div>

          {/* Wind Generation */}
          <div className="flex flex-col items-center justify-start space-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Wind className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{windPower.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Wind kW</div>
            </div>
            <FlowArrow power={windPower} direction="down" color="text-blue-600" />
          </div>

          {/* Campus Load */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Home className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{campusLoad.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Campus kW</div>
            </div>
            <div className="text-xs text-center">
              <div className={`font-semibold ${totalRenewable >= campusLoad ? 'text-green-600' : 'text-orange-600'}`}>
                {totalRenewable >= campusLoad ? '✓ Covered by Renewables' : '⚠ Deficit'}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex flex-col items-center justify-start space-y-2">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-gray-600" />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">
                {isImporting ? `+${gridImport.toFixed(1)}` : isExporting ? `-${gridExport.toFixed(1)}` : '0.0'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isImporting ? 'Import kW' : isExporting ? 'Export kW' : 'Grid kW'}
              </div>
            </div>
            <FlowArrow 
              power={gridImport} 
              direction="down" 
              color="text-red-600" 
            />
            <FlowArrow 
              power={gridExport} 
              direction="up" 
              color="text-green-600" 
            />
          </div>

          {/* Battery (Bottom Row) */}
          <div className="col-span-4 flex justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-12 bg-purple-100 rounded-lg flex items-center justify-center relative">
                <Battery className="h-8 w-6 text-purple-600" />
                <div className="absolute -bottom-6 text-xs font-semibold">
                  {batterySOC.toFixed(1)}% SoC
                </div>
              </div>
              <div className="text-center">
                <div className={`font-bold text-lg ${isCharging ? 'text-green-600' : isDischarging ? 'text-orange-600' : 'text-gray-500'}`}>
                  {Math.abs(batteryCharge).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isCharging ? 'Charging kW' : isDischarging ? 'Discharging kW' : 'Idle kW'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Balance Summary */}
        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <h3 className="font-semibold mb-2">Energy Balance</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Generation: </span>
              <span className="text-green-600">{totalRenewable.toFixed(1)} kW</span>
            </div>
            <div>
              <span className="font-medium">Campus Demand: </span>
              <span className="text-blue-600">{campusLoad.toFixed(1)} kW</span>
            </div>
            <div>
              <span className="font-medium">Net Balance: </span>
              <span className={`${totalRenewable - campusLoad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(totalRenewable - campusLoad).toFixed(1)} kW
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};