
import React, { useState, useCallback } from "react";
import Header from "../components/Header";
import ChatBot from "../components/ChatBot";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "../components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LayoutDashboard, 
  Search, 
  AlertTriangle, 
  GitBranch, 
  Brain 
} from "lucide-react";

const sidebarTabs = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Process Discovery", path: "/process-discovery", icon: Search },
  { label: "Outlier Analysis", path: "/outlier-analysis", icon: AlertTriangle },
  { label: "CCM", path: "/ccm", icon: GitBranch },
  { label: "Overall AI Insights", path: "/ai-insights", icon: Brain },
];

interface AppLayoutProps {
  children: React.ReactNode;
  onSelectWidgets?: () => void;
}

const AppLayout = ({
  children,
  onSelectWidgets = () => {},
}: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Global chatbot state
  const [chatbotVisualizations, setChatbotVisualizations] = useState<
    Array<{
      id: string;
      type: string;
      data: any[];
      title: string;
    }>
  >([]);

  // Handler for chatbot data
  const handleChatbotDataReceived = useCallback(
    (type: string, data: any[], title: string) => {
      const id = `data-viz-${type}-${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}`;
      setChatbotVisualizations((prev) => [...prev, { id, type, data, title }]);
    },
    []
  );

  const clearChatbotVisualizations = useCallback(() => {
    setChatbotVisualizations([]);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Global Header */}
      <Header onSelectWidgets={onSelectWidgets} />
      
      <SidebarProvider>
        <div className="flex w-full" style={{ height: 'calc(100vh - 80px)' }}>
          <Sidebar className="border-r border-gray-200/60 bg-white/95 backdrop-blur-sm shadow-lg">
            <SidebarContent className="pt-6">
              <div className="px-4">
                <SidebarMenu className="space-y-2">
                  {sidebarTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = location.pathname === tab.path || 
                      (tab.path === "/" && location.pathname === "");
                    
                    return (
                      <SidebarMenuItem key={tab.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => navigate(tab.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                              : "hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 hover:shadow-sm"
                          }`}
                        >
                          <IconComponent 
                            className={`w-5 h-5 transition-colors duration-300 ${
                              isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                            }`} 
                          />
                          <span className={`transition-colors duration-300 ${isMobile ? "text-xs" : ""}`}>
                            {tab.label}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>
          
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
              <div className="p-8 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
        
        <div className="fixed bottom-6 right-6 z-50">
          <ChatBot
            onDataReceived={handleChatbotDataReceived}
            visualizations={chatbotVisualizations}
            clearVisualizations={clearChatbotVisualizations}
          />
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;
