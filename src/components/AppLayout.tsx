
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

const sidebarTabs = [
  { label: "Dashboard", path: "/" },
  { label: "Process Discovery", path: "/process-discovery" },
  { label: "Outlier Analysis", path: "/outlier-analysis" },
  { label: "CCM", path: "/ccm" },
  { label: "Overall AI Insights", path: "/ai-insights" },
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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Sidebar className="border-r border-gray-200 bg-white shadow-sm">
          <SidebarContent className="py-8">
            <div className="px-6">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center border border-gray-100">
                    <img 
                      src="/lovable-uploads/d5c7649c-9487-4c95-b678-691482751d56.png" 
                      alt="GenUI Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GenUI</h1>
                </div>
              </div>
              
              <SidebarMenu className="space-y-3">
                {sidebarTabs.map((tab) => (
                  <SidebarMenuItem key={tab.path}>
                    <SidebarMenuButton
                      isActive={
                        location.pathname === tab.path ||
                        (tab.path === "/" && location.pathname === "")
                      }
                      onClick={() => navigate(tab.path)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium ${
                        location.pathname === tab.path ||
                        (tab.path === "/" && location.pathname === "")
                          ? "bg-blue-600 text-white shadow-lg transform scale-[1.02]"
                          : "hover:bg-blue-50 text-gray-700 hover:text-blue-600 hover:scale-[1.01]"
                      }`}
                    >
                      <span className={isMobile ? "text-sm" : ""}>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <Header onSelectWidgets={onSelectWidgets} />
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-8 max-w-7xl mx-auto">
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
