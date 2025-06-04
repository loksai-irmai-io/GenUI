
import React from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
      <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center">
            <img 
              src="/lovable-uploads/f6f50dd7-f1e5-42e5-9eec-8da56daf50d1.png" 
              alt="IRMAI Logo" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">GenUI</h1>
            <p className="text-sm md:text-base text-gray-600 font-medium">Process Intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <Button
            variant="outline"
            size="default"
            onClick={onSelectWidgets}
            className="hidden sm:flex border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 px-4 py-2 font-medium"
            aria-label="Configure Widgets"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Configure Widgets</span>
            <span className="md:hidden">Configure</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={onSelectWidgets}
            className="sm:hidden"
            aria-label="Configure Widgets"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
            <User className="w-4 h-4 text-gray-500" />
            <span className="max-w-32 md:max-w-none truncate font-medium">{user?.email}</span>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            size="default"
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 px-4 py-2 font-medium"
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
