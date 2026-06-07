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
  ChevronDown,
  Palette,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
    { name: "LUT Filters", href: "/admin/luts", icon: Palette },
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
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col hidden md:flex">
        <div className="p-6 border-b border-outline-variant flex items-center h-[72px]">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${isActive
                    ? "bg-surface-variant text-primary font-medium border-r-2 border-primary"
                    : "text-secondary hover:bg-surface-variant/50 hover:text-primary"
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
              className="flex items-center justify-between w-full px-4 py-3 rounded-none transition-colors text-secondary hover:bg-surface-variant/50 hover:text-primary"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5" />
                CMS Marketing
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isCmsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCmsOpen && (
              <div className="mt-2 ml-4 pl-4 border-l border-outline-variant space-y-1">
                {cmsItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-2 rounded-none text-sm transition-colors ${isActive
                          ? "text-primary font-medium border-l-2 border-primary pl-3"
                          : "text-secondary hover:text-primary border-l-2 border-transparent pl-3"
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
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold uppercase">
              {adminEmail.charAt(0)}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-on-surface">Admin</p>
              <p className="text-xs text-secondary truncate max-w-[120px]">
                {adminEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2.5 rounded-xl text-secondary hover:bg-surface-variant hover:text-primary transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface-container-lowest border-b border-outline-variant h-[72px] flex justify-between items-center px-6">
          <h2 className="text-xl font-display-md text-primary tracking-tight">
            Admin Panel
          </h2>
          <button onClick={handleLogout} className="ml-auto text-secondary hover:text-primary">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
