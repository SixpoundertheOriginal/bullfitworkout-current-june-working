
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, Dumbbell, BarChart3, User, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MainMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BarChart3, label: 'Overview', path: '/overview' },
    { icon: Zap, label: 'Training', path: '/training-session' },
    { icon: Dumbbell, label: 'Exercises', path: '/all-exercises' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-72 bg-gray-900 border-gray-800 text-white"
      >
        <div className="flex flex-col space-y-4 mt-8">
          <div className="px-2">
            <h2 className="text-lg font-semibold text-white mb-1">Menu</h2>
            <p className="text-sm text-gray-400">Navigate through the app</p>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map(({ icon: Icon, label, path }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left py-3 px-4",
                  location.pathname === path 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
                onClick={() => handleNavigation(path)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </Button>
            ))}
          </nav>
          
          {/* Additional Menu Sections */}
          <div className="border-t border-gray-800 pt-4 mt-6">
            <div className="px-2 mb-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Quick Actions
              </h3>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => {
                handleNavigation('/training-session');
              }}
            >
              <Zap className="mr-3 h-5 w-5" />
              Start Workout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
