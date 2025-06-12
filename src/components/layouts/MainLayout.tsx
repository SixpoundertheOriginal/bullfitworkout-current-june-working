
import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PageHeader } from '@/components/navigation/PageHeader';
import { MainMenu } from '@/components/navigation/MainMenu';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isTrainingSession = location.pathname === '/training-session';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isTrainingSession && <PageHeader title="BullFit" />}
      <main className={cn(
        "flex-1",
        !isTrainingSession && "pt-16 pb-16"
      )}>
        {children}
      </main>
      {!isTrainingSession && <BottomNav />}
      <MainMenu />
    </div>
  );
};
