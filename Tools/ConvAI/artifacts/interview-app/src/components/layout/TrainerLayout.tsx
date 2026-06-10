import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, BarChart3, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveTrainerApiKey } from "@/lib/api";

interface TrainerLayoutProps {
  children: React.ReactNode;
}

export function TrainerLayout({ children }: TrainerLayoutProps) {
  const [location] = useLocation();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(window.localStorage.getItem("trainer_api_key") ?? "");
  }, []);

  const handleSaveToken = () => {
    saveTrainerApiKey(token);
  };

  const handleClearToken = () => {
    setToken("");
    saveTrainerApiKey("");
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tests", label: "Tests", icon: FileText },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/30 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <div>
            <img src="/images/UNext_Logo.png" alt="uNext" className="h-10 w-auto" />
            <p className="text-xs text-muted-foreground">Trainer Platform</p>
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

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <KeyRound className="w-4 h-4 text-primary" />
              Trainer Access Key
            </div>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Set TRAINER_API_KEY"
              className="mb-2 bg-background/60 border-white/10"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleSaveToken}>
                Save
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={handleClearToken}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-white/5 bg-card/30 flex items-center justify-between">
          <div className="flex items-center">
             <img src="/images/UNext_Logo.png" alt="uNext" className="h-7 w-auto" />
          </div>
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
