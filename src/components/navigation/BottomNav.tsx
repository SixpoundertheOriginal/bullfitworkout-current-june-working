
import { Clock, Zap, User as UserIcon, Dumbbell, BarChart3 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useWorkoutNavigation } from "@/context/WorkoutNavigationContext";

export const BottomNav = () => {
  const location = useLocation();
  const { confirmNavigation } = useWorkoutNavigation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
  
  if (isDialogOpen) {
    return null;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-sm z-10">
      <NavButton 
        icon={<Clock size={20} />} 
        label="Home" 
        active={isActive('/')} 
        onClick={() => confirmNavigation('/')} 
      />
      <NavButton 
        icon={<BarChart3 size={20} />} 
        label="Overview" 
        active={isActive('/overview')}
        onClick={() => confirmNavigation('/overview')} 
      />
      <NavButton 
        icon={<Zap size={20} />} 
        label="Workouts"
        active={isActive('/workouts') || isActive('/training-session')}
        onClick={() => confirmNavigation('/workouts')}
      />
      <NavButton 
        icon={<Dumbbell size={20} />} 
        label="Exercises"
        active={isActive('/all-exercises')}
        onClick={() => confirmNavigation('/all-exercises')}
      />
      <NavButton 
        icon={<UserIcon size={20} />} 
        label="Profile" 
        active={isActive('/profile')}
        onClick={() => confirmNavigation('/profile')} 
      />
    </nav>
  );
};

const NavButton = ({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center py-3 ${active ? 'text-white' : 'text-gray-500'}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};
