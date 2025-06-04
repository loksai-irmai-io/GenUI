
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
  GitBranch, 
  AlertTriangle, 
  Target, 
  Brain,
  ChevronRight
} from "lucide-react";

const sidebarTabs = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Process Discovery", path: "/process-discovery", icon: GitBranch },
  { label: "Outlier Analysis", path: "/outlier-analysis", icon: AlertTriangle },
  { label: "CCM", path: "/ccm", icon: Target },
  { label: "AI Insights", path: "/ai-insights", icon: Brain },
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-gray-200/80 bg-white/90 backdrop-blur-sm shadow-sm">
          <SidebarContent className="py-8 px-2">
            <SidebarMenu className="space-y-2">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path || (tab.path === "/" && location.pathname === "");
                
                return (
                  <SidebarMenuItem key={tab.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(tab.path)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 text-base font-medium group ${
                        isActive
                          ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-200/50"
                          : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"}`} />
                        <span className={isMobile ? "text-sm" : "text-base"}>{tab.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent">
          <Header onSelectWidgets={onSelectWidgets} />
          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto min-w-0 bg-white/70 backdrop-blur-sm rounded-tl-3xl shadow-inner border-l border-t border-gray-200/50 mt-20 md:mt-24">
            <div className="max-w-7xl mx-auto space-y-8">
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
