
import { Clock, Zap, User as UserIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-3 border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-sm z-50">
      <NavButton 
        icon={<Clock size={20} />} 
        label="Today" 
        active={isActive('/')} 
        onClick={() => navigate('/')} 
      />
      <NavButton 
        icon={<Zap size={20} />} 
        label="Training" 
        active={isActive('/training')}
        onClick={() => navigate('/training')} 
      />
      <NavButton 
        icon={<UserIcon size={20} />} 
        label="Profile" 
        active={isActive('/profile')}
        onClick={() => navigate('/profile')} 
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
