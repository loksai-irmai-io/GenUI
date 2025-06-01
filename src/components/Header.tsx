
import React from 'react';
import { Button } from "@/components/ui/button";
import { User, Grid3X3, LogOut, Bell, Settings, Search } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onSelectWidgets: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSelectWidgets }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Grid3X3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              GenUI Enterprise
            </h1>
            <span className="text-xs text-gray-500 font-medium">
              Advanced Analytics Platform
            </span>
          </div>
        </div>
        
        {/* Center Navigation */}
        <div className="hidden md:flex items-center space-x-1 bg-gray-50 rounded-full p-1">
          <Button 
            onClick={onSelectWidgets}
            variant="ghost" 
            className="flex items-center space-x-2 hover:bg-white hover:shadow-md transition-all duration-200 rounded-full px-4 py-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="font-medium">Widgets</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 hover:bg-white hover:shadow-md transition-all duration-200 rounded-full px-4 py-2"
          >
            <Search className="w-4 h-4" />
            <span className="font-medium">Search</span>
          </Button>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="relative hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
              2
            </Badge>
          </Button>
          
          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-full pl-4 pr-2 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold text-gray-800">
                  {user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            
            <Button 
              onClick={handleSignOut}
              variant="ghost" 
              size="icon"
              className="hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
