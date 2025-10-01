import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Gauge, Target } from 'lucide-react';

interface CampusLoadInputProps {
  currentLoad: number;
  targetLoad: number;
}

export const CampusLoadInput: React.FC<CampusLoadInputProps> = ({ currentLoad, targetLoad }) => {
  const [newTargetLoad, setNewTargetLoad] = useState(targetLoad);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateTargetLoad = async () => {
    if (newTargetLoad <= 0) {
      toast({
        title: "Invalid Input",
        description: "Target load must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the most recent record first
      const { data: latestData, error: fetchError } = await supabase
        .from('campus_load_data')
        .select('id')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (latestData) {
        // Update existing record with WHERE clause
        const { error: updateError } = await supabase
          .from('campus_load_data')
          .update({ target_load_kw: newTargetLoad })
          .eq('id', latestData.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record if none exists
        const { error: insertError } = await supabase
          .from('campus_load_data')
          .insert({
            target_load_kw: newTargetLoad,
            total_load_kw: 300,
            hvac_load_kw: 120,
            lighting_load_kw: 60,
            equipment_load_kw: 90,
            other_load_kw: 30,
            load_forecast_kw: 310,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Target Load Updated",
        description: `Campus target load set to ${newTargetLoad} kW`,
      });
    } catch (error) {
      console.error('Error updating target load:', error);
      toast({
        title: "Update Failed",
        description: "Could not update target load",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Campus Load Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Current Load
            </Label>
            <div className="p-3 bg-secondary rounded-md">
              <span className="text-2xl font-bold">{currentLoad.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-1">kW</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Target Load
            </Label>
            <div className="p-3 bg-secondary rounded-md">
              <span className="text-2xl font-bold">{targetLoad.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-1">kW</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newTargetLoad">Set New Target Load (kW)</Label>
          <div className="flex gap-2">
            <Input
              id="newTargetLoad"
              type="number"
              value={newTargetLoad}
              onChange={(e) => setNewTargetLoad(Number(e.target.value))}
              placeholder="Enter target load in kW"
              min="1"
              max="2000"
            />
            <Button 
              onClick={updateTargetLoad} 
              disabled={loading || newTargetLoad === targetLoad}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>The energy management system will optimize renewable energy flow based on this target load:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Renewables power the load first</li>
            <li>Excess charges battery or exports to grid</li>
            <li>Deficit draws from battery then grid</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};