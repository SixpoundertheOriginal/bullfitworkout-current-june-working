
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
}

export const BaseCard = React.memo<BaseCardProps>(({ children, className }: BaseCardProps) => {
  return (
    <Card className={cn("bg-gray-900 border-gray-800", className)}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Simple props comparison
  return prevProps.className === nextProps.className;
  // Note: We don't compare children since React will handle that
});

BaseCard.displayName = 'BaseCard';
