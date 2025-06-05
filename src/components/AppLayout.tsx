
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
  Users, 
  Brain 
} from "lucide-react";

const sidebarTabs = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Process Discovery", path: "/process-discovery", icon: Search },
  { label: "Outlier Analysis", path: "/outlier-analysis", icon: AlertTriangle },
  { label: "CCM", path: "/ccm", icon: Users },
  { label: "Overall AI Insights", path: "/ai-insights", icon: Brain },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({
  children,
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

  // Simple handler for widget refresh
  const handleWidgetRefresh = useCallback(() => {
    // This can be used to trigger refresh of widgets if needed
    console.log("Widget configuration updated");
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-gray-200/60 bg-white/95 backdrop-blur-md shadow-lg">
          <SidebarContent className="py-6">
            <div className="px-4 mb-8">
              <div className="flex items-center space-x-3 px-2">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center border border-gray-100">
                  <img 
                    src="/lovable-uploads/f6f50dd7-f1e5-42e5-9eec-8da56daf50d1.png" 
                    alt="IRMAI Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">GenUI</h1>
              </div>
            </div>
            <div className="px-3">
              <SidebarMenu className="space-y-2">
                {sidebarTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = location.pathname === tab.path || (tab.path === "/" && location.pathname === "");
                  
                  return (
                    <SidebarMenuItem key={tab.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => navigate(tab.path)}
                        className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50 border border-blue-600"
                            : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/80 text-gray-700 hover:text-blue-700 border border-transparent hover:border-blue-200/50"
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                        }`} />
                        <span className={`${isMobile ? "text-sm" : ""} truncate`}>{tab.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent">
          <Header onSelectWidgets={handleWidgetRefresh} />
          <main className="flex-1 p-8 overflow-auto min-w-0 bg-white/70 backdrop-blur-sm rounded-tl-3xl shadow-inner border-l border-t border-gray-200/60 mt-20">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
        <div className="fixed bottom-6 right-6 z-50">
          <ChatBot
            onDataReceived={handleChatbotDataReceived}
            visualizations={chatbotVisualizations}
            clearVisualizations={clearChatbotVisualizations}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
