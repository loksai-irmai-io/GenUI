
import React from "react";
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
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Process Discovery", path: "/process-discovery", icon: "🔍" },
  { label: "Outlier Analysis", path: "/outlier-analysis", icon: "📈" },
  { label: "CCM", path: "/ccm", icon: "⚙️" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  onSelectWidgets?: () => void;
  onDataReceived?: (type: string, data: any[], title: string) => void;
  chatbotVisualizations?: Array<{
    id: string;
    type: string;
    data: any[];
    title: string;
  }>;
}

const AppLayout = ({
  children,
  onSelectWidgets = () => {},
  onDataReceived = () => {},
  chatbotVisualizations,
}: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-gray-200 bg-white/95 backdrop-blur-sm">
          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2 mt-4">
              {sidebarTabs.map((tab) => (
                <SidebarMenuItem key={tab.path}>
                  <SidebarMenuButton
                    isActive={
                      location.pathname === tab.path ||
                      (tab.path === "/" && location.pathname === "")
                    }
                    onClick={() => navigate(tab.path)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium group ${
                      location.pathname === tab.path ||
                      (tab.path === "/" && location.pathname === "")
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                    }`}
                  >
                    <span className="text-xl mr-3">{tab.icon}</span>
                    <span className="font-semibold">{tab.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <Header onSelectWidgets={onSelectWidgets} />
          <main className="flex-1 p-6 overflow-auto min-w-0">
            <div className="w-full h-full">
              {children}
            </div>
          </main>
        </SidebarInset>
        
        <div className="fixed bottom-6 right-6 z-50">
          <ChatBot
            onDataReceived={onDataReceived}
            visualizations={chatbotVisualizations}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
