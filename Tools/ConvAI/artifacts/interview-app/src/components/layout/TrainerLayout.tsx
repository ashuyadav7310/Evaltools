import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearTrainerSession, saveAdminToken } from "@/lib/api";

interface TrainerLayoutProps {
  children: React.ReactNode;
}

export function TrainerLayout({ children }: TrainerLayoutProps) {
  const [location, setLocation] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const basePath = isAdmin ? "/admin" : "/trainer";

  const handleSignOut = () => {
    if (isAdmin) {
      saveAdminToken("");
      setLocation("/");
      return;
    }
    clearTrainerSession();
    setLocation("/trainer-login");
  };

  const navItems = isAdmin
    ? [{ href: basePath, label: "Dashboard", icon: LayoutDashboard }]
    : [
        { href: basePath, label: "Dashboard", icon: LayoutDashboard },
        { href: `${basePath}/tests`, label: "Tests", icon: FileText },
        { href: `${basePath}/reports`, label: "Reports", icon: BarChart3 },
      ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/30 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <div>
            <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="uNext" className="h-10 w-auto" />
            <p className="text-xs text-muted-foreground">{isAdmin ? "Admin Center" : "Trainer Platform"}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-white/5 bg-card/30 flex items-center justify-between">
          <div className="flex items-center">
             <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="uNext" className="h-7 w-auto" />
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
