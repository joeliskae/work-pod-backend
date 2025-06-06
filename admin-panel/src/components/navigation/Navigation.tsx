import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Tablet, 
  Info, 
  LogOut, 
  User, 
  Menu,
  X
} from 'lucide-react';
import { type User as UserType } from '../../types';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: UserType;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  setCurrentPage, 
  user, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'analytics', label: 'Analytiikka', icon: BarChart3 },
    { id: 'calendars', label: 'Kalenterit', icon: Calendar },
    { id: 'tablets', label: 'Tabletit', icon: Tablet },
    { id: 'info', label: 'Tietoja', icon: Info },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Kirjaudu ulos</span>
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};