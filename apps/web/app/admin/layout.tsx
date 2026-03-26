"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image,
  Users,
  Briefcase,
  Tag,
  MessageSquare,
  MapPin,
  Settings,
  LogOut,
  Video,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Hero", href: "/admin/hero", icon: Image },
  { name: "About", href: "/admin/about", icon: Users },
  { name: "CEO Message", href: "/admin/ceo", icon: MessageSquare },
  { name: "Services", href: "/admin/services", icon: Briefcase },
  { name: "Doctors", href: "/admin/doctors", icon: Users },
  { name: "Promotions", href: "/admin/promotions", icon: Tag },
  { name: "Video Showcase", href: "/admin/video", icon: Video },
  { name: "Gallery", href: "/admin/gallery", icon: Image },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Contact & Location", href: "/admin/contact", icon: MapPin },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("adminUser");
    const token = localStorage.getItem("adminToken");

    if (!token || !userData) {
      router.push("/login/admin");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const links = useMemo(
    () =>
      menuItems.map((item) => ({
        label: item.name,
        href: item.href,
        icon: (
          <item.icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              pathname === item.href ? "text-white" : "text-slate-300 group-hover/sidebar:text-white"
            )}
          />
        ),
      })),
    [pathname]
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/login/admin");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 bg-slate-900 border-r border-slate-800">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex-shrink-0" />
              {open && <span className="text-white font-bold tracking-wide">MESRC PANEL</span>}
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <SidebarLink
                    key={link.label}
                    link={link}
                    className={cn(
                      "px-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                    onClick={() => setOpen(false)}
                  />
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            {open && (
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {open && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
