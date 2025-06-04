
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
      <div className="flex items-center justify-end px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectWidgets}
            className="flex items-center space-x-2 border-blue-200/80 text-blue-600 hover:bg-blue-50/80 hover:border-blue-300/80 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
            aria-label="Configure Widgets"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configure Widgets</span>
          </Button>

          <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600 bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-200/60 shadow-sm backdrop-blur-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="max-w-32 md:max-w-none truncate font-medium text-gray-700">
              {user?.email}
            </span>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 hover:bg-red-50/80 hover:border-red-300/80 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
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
