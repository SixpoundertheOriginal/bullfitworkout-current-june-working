
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-purple-500" />
          <span className="text-xl font-bold text-white">Workout App</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/exercises" className="text-gray-300 hover:text-white transition-colors">
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
