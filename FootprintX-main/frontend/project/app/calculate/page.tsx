'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';
import { computePhysical } from '@/lib/formulas';
import AuthGuard from '@/components/AuthGuard';
import {
  Car,
  Factory,
  Home,
  Plane,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import axios from 'axios';

function CalculatePageContent() {
  const [transportation, setTransportation] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [waste, setWaste] = useState(0);
  const [shopping, setShopping] = useState(0);
  const [flights, setFlights] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const physical = computePhysical({
    transportationKmPerDay: transportation,
    energyKwhPerMonth: energy,
    wasteKgPerWeek: waste,
    shoppingUsdPerMonth: shopping,
    flightsHoursPerYear: flights
  });

  const transportationScore = physical.breakdown.transportation;
  const energyScore = physical.breakdown.energy;
  const wasteScore = physical.breakdown.waste;
  const shoppingScore = physical.breakdown.shopping;
  const flightsScore = physical.breakdown.flights;

  const totalEmissions = physical.total;
  const scoreForLeaderboard = physical.leaderboardScore;

  const handleSaveCalculation = async () => {
    setIsSaving(true);
    const calculationData = {
      inputData: {
        transportation_km_day: transportation,
        energy_kwh_month: energy,
        waste_kg_week: waste,
        shopping_usd_month: shopping,
        flights_hours_year: flights,
        type: 'physical'
      },
      result: totalEmissions,
      score: scoreForLeaderboard,
    };

    try {
      const response = await apiClient.post('/api/calculate', calculationData);
      console.log('Calculation saved:', response.data);
      toast.success("Calculation saved successfully!")
    } catch (error) {
      let errorMessage = "Failed to save calculation.";
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
        errorMessage = error.response?.data?.msg || error.message || errorMessage;
      } else {
        console.error('Non-Axios error:', error);
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Calculate Your Carbon Footprint</h1>
        <p className="mt-2 text-muted-foreground">
          Track your environmental impact by entering your consumption data below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Car className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Transportation</h3>
              <p className="text-sm text-muted-foreground">
                Daily commute distance (km)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[transportation]}
              onValueChange={(value) => setTransportation(value[0])}
              max={100}
              step={1}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{transportation} km/day</span>
              <span>{(transportationScore / 365).toFixed(1)} kg CO₂e/day</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Home className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Energy Usage</h3>
              <p className="text-sm text-muted-foreground">
                Monthly electricity consumption (kWh)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[energy]}
              onValueChange={(value) => setEnergy(value[0])}
              max={1000}
              step={10}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{energy} kWh/month</span>
              <span>{(energyScore / 12).toFixed(1)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Trash2 className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Waste</h3>
              <p className="text-sm text-muted-foreground">
                Weekly waste production (kg)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[waste]}
              onValueChange={(value) => setWaste(value[0])}
              max={50}
              step={0.5}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{waste} kg/week</span>
              <span>{(wasteScore / 52).toFixed(1)} kg CO₂e/week</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Shopping</h3>
              <p className="text-sm text-muted-foreground">
                Monthly spending on new items ($)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[shopping]}
              onValueChange={(value) => setShopping(value[0])}
              max={1000}
              step={10}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>${shopping}/month</span>
              <span>{(shoppingScore / 12).toFixed(1)} kg CO₂e/month</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Plane className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Air Travel</h3>
              <p className="text-sm text-muted-foreground">
                Flight hours per year
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[flights]}
              onValueChange={(value) => setFlights(value[0])}
              max={100}
              step={1}
              disabled={isSaving}
            />
            <div className="flex justify-between text-sm">
              <span>{flights} hours/year</span>
              <span>{flightsScore.toFixed(1)} kg CO₂e/year</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <div className="mb-6 flex items-center gap-4">
          <Factory className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold">Total Carbon Footprint</h3>
            <p className="text-sm text-muted-foreground">
              Estimated annual emissions
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <Progress value={Math.min((totalEmissions / 20000) * 100, 100)} />
          <div className="flex justify-between text-sm">
            <span>Annual Total</span>
            <span className="font-semibold">{totalEmissions.toFixed(1)} kg CO₂e</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>(Score for Leaderboard)</span>
            <span className="font-semibold">{scoreForLeaderboard}</span>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          onClick={handleSaveCalculation}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Calculation'}
        </Button>
      </Card>
    </div>
  );
}

export default function CalculatePage() {
  return (
    <AuthGuard>
      <CalculatePageContent />
    </AuthGuard>
  );
}