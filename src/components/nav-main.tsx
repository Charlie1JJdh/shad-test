"use client"

import React from "react"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = 
  | {
      title: string
      url: string
      icon: Icon
    }
  | {
      title: string
      isSection: true
      url?: never
      icon?: never
    }

type NavItemWithSection = NavItem & { isSection?: boolean }

export function NavMain({
  items,
}: {
  items: NavItemWithSection[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="New RFQ"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>New RFQ</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item, index) => (
            <React.Fragment key={`${item.title}-${index}`}>
              {item.isSection ? (
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                  {item.title}
                </SidebarGroupLabel>
              ) : (
                <SidebarMenuItem>
                  {!item.isSection ? (
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <div className="px-4 py-2">
                      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </SidebarGroupLabel>
                    </div>
                  )}
                </SidebarMenuItem>
              )}
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
