import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  HouseIcon,
  CheckSquareIcon,
  PlantIcon,
  GearIcon,
  FlowerTulipIcon,
} from "@phosphor-icons/react"

const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HouseIcon />,
    exact: true,
  },
  {
    title: "Tasks",
    to: "/tasks",
    icon: <CheckSquareIcon />,
  },
  {
    title: "Plants",
    to: "/plants",
    icon: <PlantIcon />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <GearIcon />,
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; image?: string | null }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default select-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FlowerTulipIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Gieter</span>
                <span className="truncate text-xs text-muted-foreground">
                  Plant manager
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
