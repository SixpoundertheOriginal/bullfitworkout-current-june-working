
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { MainMenu } from '@/components/navigation/MainMenu';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden">
          <MainMenu />
        </div>
        
        {/* Logo - Always visible */}
        <Link to="/" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-purple-500" />
          <span className="text-xl font-bold text-white">Workout App</span>
        </Link>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/overview" className="text-gray-300 hover:text-white transition-colors">
            Overview
          </Link>
          <Link to="/all-exercises" className="text-gray-300 hover:text-white transition-colors">
            Exercises
          </Link>
          <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
};
