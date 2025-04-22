
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2">{icon}</div>
          <div className="text-xl font-semibold text-white">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
