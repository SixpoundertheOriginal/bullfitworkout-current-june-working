
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { WorkoutBanner } from '@/components/training/WorkoutBanner';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  noHeader?: boolean;
  noFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  noHeader = false, 
  noFooter = false 
}) => {
  const location = useLocation();
  const isTrainingSession = location.pathname === '/training-session';
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      {!noHeader && !isTrainingSession && <Header />}
      
      {/* Main Content */}
      <main className={cn(
        "flex-1",
        isTrainingSession ? "pt-0" : "pt-16",
        // Adjust bottom padding - no padding when training session (footer handles it)
        isTrainingSession ? "pb-0" : "pb-20 lg:pb-16"
      )}>
        {children}
      </main>
      
      {/* Footer - Hidden on mobile when bottom nav is present */}
      {!noFooter && !isTrainingSession && (
        <Footer />
      )}
      
      {/* Bottom Navigation - Hidden on training session pages */}
      {!isTrainingSession && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
      
      {/* Workout Banner */}
      <WorkoutBanner />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};
