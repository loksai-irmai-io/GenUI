
import React from 'react';
import { Button } from "@/components/ui/button";
import { User, Grid3X3, LogOut, RefreshCw } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWidgetRefresh } from '@/contexts/WidgetRefreshContext';

interface HeaderProps {
  onSelectWidgets: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSelectWidgets }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { refreshAll, isRefreshing } = useWidgetRefresh();

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

  const handleRefreshAll = () => {
    refreshAll();
    toast({
      title: "Refreshing data",
      description: "All widgets are being updated with the latest data.",
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Grid3X3 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GenUI</h1>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Enterprise Dashboard</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh All</span>
          </Button>
          
          <Button 
            onClick={onSelectWidgets}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2 bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-medium transition-all duration-200"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Widgets</span>
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</span>
              <span className="text-xs text-gray-500">Administrator</span>
            </div>
          </div>
          
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2 bg-white hover:bg-red-50 border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-700 font-medium transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
