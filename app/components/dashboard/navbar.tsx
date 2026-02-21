"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Menu, Search, User, LogOut, Settings as SettingsIcon } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/app/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Sidebar } from "@/app/components/dashboard/sidebar"
import { LanguageSelector } from "@/app/components/language-selector"
import { useLanguage } from "@/app/lib/i18n/LanguageContext"

export function Navbar() {
  const { data: session } = useSession()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0">
            <Sidebar className="border-none w-full" showToggle={false} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2">
           <span className="text-xl font-bold"><span className="gradient-text">Lingua</span>AI</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 mr-6">
           <span className="text-xl font-bold"><span className="gradient-text">Lingua</span>AI</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search lessons..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50"
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
            <div className="hidden md:block w-32">
                 <LanguageSelector type="learning" showLabel={false} />
            </div>
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer w-full flex items-center">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => signOut()}>
                   <LogOut className="mr-2 h-4 w-4" />
                   Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
