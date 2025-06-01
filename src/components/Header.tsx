
import React from "react";
import { Bell, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWidgetRefresh } from "@/contexts/WidgetRefreshContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  onSelectWidgets: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSelectWidgets }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshAll, isRefreshing } = useWidgetRefresh();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out of your account.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-blue-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Process Analytics</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isRefreshing}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh All"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSelectWidgets}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Widgets
          </Button>

          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
            <Bell className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-500">Process Analyst</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-600"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
