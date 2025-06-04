
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-end px-8 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectWidgets}
            className="flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
            aria-label="Configure Widgets"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configure Widgets</span>
          </Button>

          <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <User className="w-4 h-4" />
            <span className="max-w-32 md:max-w-none truncate font-medium">{user?.email}</span>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 shadow-sm"
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
