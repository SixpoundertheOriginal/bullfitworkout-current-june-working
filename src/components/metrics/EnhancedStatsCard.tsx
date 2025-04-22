
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const EnhancedStatsCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  className = "" 
}: StatsCardProps) => {
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-gray-800 text-purple-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
