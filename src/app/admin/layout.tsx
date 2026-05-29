"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Image as ImageIcon,
  LogOut,
  Loader2,
  PlusSquare,
  Settings,
  Download,
  FileText,
  Ticket,
  History,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [isCmsOpen, setIsCmsOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (session) {
        setIsAuthenticated(true);
        setAdminEmail(session.user.email || "Admin");
      }
    };

    checkSession();

    // Listen for auth state changes (login/logout from other tabs, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== "/admin/login") {
        setIsAuthenticated(false);
        router.push("/admin/login");
      } else if (session) {
        setIsAuthenticated(true);
        setAdminEmail(session.user.email || "Admin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Riwayat Transaksi", href: "/admin/transactions", icon: History },
    { name: "Manajemen Voucher", href: "/admin/vouchers", icon: Ticket },
    { name: "Manajemen Frame", href: "/admin/frames", icon: ImageIcon },
    { name: "Buat Frame Baru", href: "/admin/frames/create", icon: PlusSquare },
    { name: "Kategori Kertas", href: "/admin/categories", icon: FileText },
    { name: "Manajemen Download", href: "/admin/downloads", icon: Download },
    { name: "Pengaturan", href: "/admin/settings", icon: Settings },
  ];

  const cmsItems = [
    { name: "Home Page", href: "/admin/cms/home" },
    { name: "Portfolio", href: "/admin/cms/portfolio" },
    { name: "Services", href: "/admin/cms/services" },
    { name: "Contact", href: "/admin/cms/contact" },
  ];

  return (
    <div className="min-h-screen bg-surface flex font-sans text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container border-r border-outline-variant flex flex-col hidden md:flex">
        <div className="p-6 border-b border-outline-variant flex justify-center">
          <img 
            src="/images/memoire-logo.png" 
            alt="Mémoire Logo" 
            className="h-8 w-auto object-contain mix-blend-multiply opacity-90" 
          />
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors font-label-md uppercase tracking-widest ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "text-secondary hover:bg-surface hover:text-primary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          
          {/* CMS Dropdown */}
          <div className="pt-4 mt-4 border-t border-outline-variant">
            <button
              onClick={() => setIsCmsOpen(!isCmsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-none text-secondary hover:bg-surface hover:text-primary transition-colors font-label-md uppercase tracking-widest"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span className="font-medium text-sm">CMS Marketing</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isCmsOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCmsOpen && (
              <div className="mt-2 ml-4 pl-4 border-l border-outline-variant space-y-1">
                {cmsItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-2 rounded-none font-label-sm uppercase tracking-widest transition-colors ${
                        isActive
                          ? "text-primary font-bold bg-surface"
                          : "text-secondary hover:bg-surface hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
        <div className="p-4 border-t border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary font-bold uppercase border border-outline-variant">
              {adminEmail.charAt(0)}
            </div>
            <div className="hidden lg:block">
              <p className="font-label-sm uppercase tracking-widest text-primary">Admin</p>
              <p className="text-xs text-secondary truncate max-w-[120px]">
                {adminEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2.5 rounded-none text-secondary hover:bg-surface hover:text-primary transition-colors border border-transparent hover:border-outline-variant"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface-container border-b border-outline-variant p-4 flex justify-between items-center">
          <img 
            src="/images/memoire-logo.png" 
            alt="Mémoire Logo" 
            className="h-6 w-auto object-contain mix-blend-multiply opacity-90" 
          />
          <button onClick={handleLogout} className="text-secondary hover:text-primary transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 bg-surface">{children}</div>
      </main>
    </div>
  );
}
