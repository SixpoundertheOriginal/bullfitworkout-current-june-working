
import React from "react";
import { BaseCard } from "@/components/ui/BaseCard";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <BaseCard>
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">{icon}</div>
        <div className="text-xl font-semibold text-white">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </BaseCard>
  );
}
