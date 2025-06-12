
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, Dumbbell, BarChart3, User, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MainMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Dumbbell, label: 'Exercises', path: '/exercises' },
    { icon: BarChart3, label: 'Overview', path: '/overview' },
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
          className="fixed top-4 left-4 z-50 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col space-y-4 mt-8">
          <h2 className="text-lg font-semibold px-2">Menu</h2>
          <nav className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
