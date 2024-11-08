'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Home, MessageSquare, BarChart2, ShoppingCart, LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function AuthenticatedLayout({
                                              children,
                                            }: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-xl font-bold px-4 py-2">Home Monitor</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/messages" passHref>
                  <SidebarMenuButton>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/sensors" passHref>
                  <SidebarMenuButton>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Sensors
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/grocery" passHref>
                  <SidebarMenuButton>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Grocery List
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-6 flex justify-center items-center">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}