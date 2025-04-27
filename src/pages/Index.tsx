import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { StatCard } from "@/components/metrics/StatCard";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { DateRangeProvider } from "@/context/DateRangeContext";

export const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Today</h1>
        <Button 
          onClick={() => navigate('/training-session')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <DateRangeProvider>
          <QuickStatsSection />
        </DateRangeProvider>
        
        {/* Other components */}
      </main>
    </div>
  );
};

export default Index;
