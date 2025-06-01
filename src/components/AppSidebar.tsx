
import React from "react";
import { BarChart3, Search, TrendingUp, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Main process analytics dashboard",
  },
  {
    title: "Process Discovery",
    url: "/process-discovery",
    icon: Search,
    description: "Discover and analyze process patterns",
  },
  {
    title: "Outlier Analysis", 
    url: "/outlier-analysis",
    icon: TrendingUp,
    description: "Identify process anomalies and outliers",
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-blue-100 bg-white">
      <SidebarHeader className="p-6 border-b border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">ProcessIQ</h2>
            <p className="text-sm text-gray-500">Analytics Platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200"
                  >
                    <a href={item.url} className="flex items-center space-x-3 p-3">
                      <item.icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-blue-100">
        <div className="text-xs text-gray-500 text-center">
          © 2024 ProcessIQ Platform
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
