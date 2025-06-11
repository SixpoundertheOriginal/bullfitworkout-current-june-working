
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useScroll } from "@/hooks/useScroll";
import { useWorkoutNavigation } from "@/context/WorkoutNavigationContext";
import { useWorkoutStore } from "@/store/workoutStore";
import useScrollHeader from "@/hooks/useScrollHeader";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
  scrollResponsive?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBack,
  children,
  scrollResponsive = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isScrolled, scrollDirection } = useScroll(20);
  const { isActive } = useWorkoutStore();
  const { isHeaderVisible } = useScrollHeader();
  
  const handleBack = () => {
    if (onBack) {
      // Existing explicit back handler takes priority
      onBack();
    } else {
      // Context-aware back button logic
      if (isActive && location.pathname !== '/training-session') {
        // Return to workout session for active workouts (unless already there)
        navigate('/training-session');
      } else if (location.state?.from) {
        // Use explicit navigation state if available
        navigate(location.state.from);
      } else if (location.key !== 'default') {
        // Has history - safe to go back
        navigate(-1);
      } else {
        // No history or unknown state - go to home
        navigate('/');
      }
    }
  };

  const shouldHideOnScroll = scrollResponsive && isScrolled && scrollDirection === 'down';

  return (
    <header className={cn(
      "header-fixed backdrop-blur-sm border-gray-800/50",
      "transition-transform duration-300 ease-in-out",
      !isHeaderVisible ? "-translate-y-full" : "translate-y-0"
    )}>
      <div className="content-row min-w-0 responsive-padding">
        <div className="flex-1 flex items-center min-w-0">
          {showBackButton && (
            <button 
              onClick={handleBack} 
              className="mr-2 p-2 -ml-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>
        {children && (
          <div className="flex items-center ml-2">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};
