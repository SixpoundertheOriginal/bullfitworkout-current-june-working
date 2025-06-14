
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        {/* Main Footer Content - Desktop */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Dumbbell className="h-6 w-6 text-purple-500" />
              <span className="text-lg font-bold text-white">Workout App</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Your ultimate fitness companion for tracking workouts and achieving your goals.
            </p>
          </div>
          
          {/* Navigation Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link to="/overview" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Overview
              </Link>
              <Link to="/all-exercises" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Exercises
              </Link>
              <Link to="/training-session" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Training
              </Link>
            </div>
          </div>
          
          {/* Account & Profile */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <div className="space-y-2">
              <Link to="/profile" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Profile
              </Link>
              <Link to="/profile" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Settings
              </Link>
            </div>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Help Center
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        {/* Mobile Footer - Simplified */}
        <div className="md:hidden mb-6">
          <div className="flex justify-center space-x-8 mb-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              Home
            </Link>
            <Link to="/overview" className="text-gray-400 hover:text-white transition-colors text-sm">
              Overview
            </Link>
            <Link to="/all-exercises" className="text-gray-400 hover:text-white transition-colors text-sm">
              Exercises
            </Link>
            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
              Profile
            </Link>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Workout App. Made with <Heart className="inline h-4 w-4 text-red-500" /> for fitness enthusiasts.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
