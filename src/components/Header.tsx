
import React from "react";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center border border-gray-100">
            <img 
              src="/lovable-uploads/f6f50dd7-f1e5-42e5-9eec-8da56daf50d1.png" 
              alt="GenUI Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GenUI</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectWidgets}
            className="flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            aria-label="Configure Widgets"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configure Widgets</span>
          </Button>

          <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <User className="w-4 h-4" />
            <span className="max-w-32 md:max-w-none truncate font-medium">{user?.email}</span>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
