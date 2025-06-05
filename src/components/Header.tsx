
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import WidgetSelectionModal from "@/components/WidgetSelectionModal";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  onSelectWidgets: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSelectWidgets }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>([]);

  // Check if current page is Dashboard
  const isDashboardPage = location.pathname === "/" || location.pathname === "";

  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("selected_widgets, pinned_widgets")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user preferences:", error);
        return;
      }

      if (data) {
        setSelectedWidgets(data.selected_widgets || []);
        setPinnedWidgets(data.pinned_widgets || []);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  const handleSaveWidgets = async (newSelectedWidgets: string[], newPinnedWidgets: string[]) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          selected_widgets: newSelectedWidgets,
          pinned_widgets: newPinnedWidgets,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setSelectedWidgets(newSelectedWidgets);
      setPinnedWidgets(newPinnedWidgets);

      toast({
        title: "Preferences Saved",
        description: "Your widget preferences have been updated successfully.",
      });

      // Trigger a refresh of the dashboard
      onSelectWidgets();
      
      // Force page reload to ensure widgets display
      window.location.reload();
    } catch (error) {
      console.error("Error saving widget preferences:", error);
      toast({
        title: "Error Saving Preferences",
        description: "Failed to save your widget preferences.",
        variant: "destructive",
      });
    }
  };

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

  // Extract username from email (part before @)
  const username = user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/4fa81d66-b6af-4ee2-b81c-259365c7a007.png" 
                alt="IRMAI Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight">GenUI</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Configure Widgets Button - Only visible on Dashboard page */}
            {isDashboardPage && (
              <Button
                onClick={() => setIsWidgetModalOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border-slate-600 text-blue-400 hover:text-blue-300 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configure Widgets</span>
              </Button>
            )}

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border-slate-600 transition-all duration-200"
                >
                  <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="hidden sm:inline max-w-24 md:max-w-none truncate text-slate-200">
                    {username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 shadow-xl z-50">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-100">{username}</p>
                    <p className="text-xs leading-none text-slate-400 truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 focus:text-red-300 focus:bg-slate-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Widget Selection Modal - Only render when on Dashboard page */}
      {isDashboardPage && (
        <WidgetSelectionModal
          isOpen={isWidgetModalOpen}
          onClose={() => setIsWidgetModalOpen(false)}
          onSave={handleSaveWidgets}
          selectedWidgets={selectedWidgets}
          pinnedWidgets={pinnedWidgets}
        />
      )}
    </>
  );
};

export default Header;
