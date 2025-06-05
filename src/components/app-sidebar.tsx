"use client"

import * as React from "react"
import {
  IconFileDollar,
  IconFileInvoice,
  IconFileDescription,
  IconTruckDelivery,
  IconFiles,
  IconCreditCard,
  IconCashBanknote,
  IconShoppingCart,
  IconUser,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconDashboard,
  IconFolder,
  IconBuildingWarehouse,
  IconUserCircle,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    // Dashboard
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard
    } as const,
    
    // Trading Section
    {
      title: "Trading",
      isSection: true as const
    },
    {
      title: "RFQs",
      url: "#",
      icon: IconFileDollar,
      isSection: false
    },
    {
      title: "Quotes",
      url: "#",
      icon: IconFileInvoice,
      isSection: false
    },
    {
      title: "Contracts",
      url: "#",
      icon: IconFileDescription,
      isSection: false
    },
    {
      title: "Shipments",
      url: "#",
      icon: IconTruckDelivery,
      isSection: false
    },
    
    // Operations Section
    {
      title: "Operations",
      isSection: true as const
    },
    {
      title: "Documents",
      url: "#",
      icon: IconFiles,
      isSection: false
    },
    {
      title: "Payments",
      url: "#",
      icon: IconCreditCard,
      isSection: false
    },
    {
      title: "Financing",
      url: "#",
      icon: IconCashBanknote,
      isSection: false
    },
    
    // Account Section
    {
      title: "Account",
      isSection: true
    } as const,
    {
      title: "Orders",
      url: "#",
      icon: IconShoppingCart,
      isSection: false
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">NowExo Platform</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
