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

const sidebarTabs = [
  { label: "Dashboard", path: "/" },
  { label: "Process Discovery", path: "/process-discovery" },
  { label: "Outlier Analysis", path: "/outlier-analysis" },
  { label: "CCM", path: "/ccm" },
  { label: "Overall AI Insights", path: "/ai-insights" }, // Added under CCM
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
      <div className="flex min-h-screen bg-blue-50">
        <Sidebar>
          <SidebarContent>
            <div className="py-8">
              <div className="text-2xl font-bold text-center mb-8 tracking-tight text-blue-700">
                <span className="inline-flex items-center gap-2 justify-center">
                  <span className="bg-blue-600 p-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <rect
                        width="18"
                        height="18"
                        x="3"
                        y="3"
                        rx="4"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  GenUI
                </span>
              </div>
              <SidebarMenu>
                {sidebarTabs.map((tab) => (
                  <SidebarMenuItem key={tab.path}>
                    <SidebarMenuButton
                      isActive={
                        location.pathname === tab.path ||
                        (tab.path === "/" && location.pathname === "")
                      }
                      onClick={() => navigate(tab.path)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-150 text-base font-medium mb-2 ${
                        location.pathname === tab.path ||
                        (tab.path === "/" && location.pathname === "")
                          ? "bg-blue-100 text-blue-700 font-semibold shadow"
                          : "hover:bg-blue-200 text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-transparent">
          <Header onSelectWidgets={onSelectWidgets} />
          <main className="flex-1 p-8 overflow-auto min-w-0 bg-white rounded-2xl shadow-inner">
            {children}
          </main>
        </SidebarInset>
        <div className="fixed bottom-4 right-4 z-50">
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
