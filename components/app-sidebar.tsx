import { UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="p-0 group-data-[collapsible=icon]:p-0!"
              render={<div />}>
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: "size-full",
                    userButtonTrigger:
                      "size-full justify-start rounded-md px-2 text-sidebar-foreground shadow-none ring-sidebar-ring outline-hidden hover:bg-transparent focus-visible:ring-2 group-data-[collapsible=icon]:px-0",
                    userButtonBox: "w-full min-w-0 flex-row gap-2",
                    userButtonOuterIdentifier:
                      "order-last flex-1 truncate ps-0 text-left text-sm font-medium text-sidebar-foreground",
                    userButtonAvatarBox: "order-first size-8 rounded-lg",
                  },
                }}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
