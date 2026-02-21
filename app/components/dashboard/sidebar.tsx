"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/app/lib/i18n/LanguageContext";
import { sidebarItems } from "@/app/lib/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  showToggle?: boolean;
  showLogo?: boolean;
}

export function Sidebar({
  className,
  showToggle = true,
  showLogo = true,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();

  // Normalize user role: default to 'student' if role is missing or not recognized
  const rawRole = (session?.user as { role?: string })?.role;
  const userRole =
    rawRole === "teacher" || rawRole === "admin" ? rawRole : "student";

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-[#0F172A] text-gray-300 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center px-4 border-b border-gray-800",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {showLogo && !collapsed && (
          <span className="text-lg font-bold text-white">
            <span className="gradient-text">Lingua</span>AI
          </span>
        )}
        {showToggle && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-gray-400 hover:text-white hover:bg-white/10",
              !collapsed && showLogo && "ml-auto",
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="flex flex-col gap-2">
          {sidebarItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(`${item.href}/`) &&
                  item.href !== "/dashboard");
              const label = t(item.name) || item.name; // Fallback to item.name if translation fails

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 transition-colors",
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
                    collapsed && "justify-center px-2",
                  )}
                  title={collapsed ? label : undefined}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        {label}
                      </span>
                    )}
                  </Link>
                </Button>
              );
            })}
        </nav>
      </div>
    </div>
  );
}
