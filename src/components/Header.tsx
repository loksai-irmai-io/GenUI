
import React from 'react';
import { Button } from "@/components/ui/button";
import { User, Grid3X3, LogOut } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GenUI</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Dashboard Platform</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onSelectWidgets}
            variant="outline" 
            className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Select Widgets</span>
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          
          <Button 
            onClick={handleSignOut}
            variant="outline" 
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
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
