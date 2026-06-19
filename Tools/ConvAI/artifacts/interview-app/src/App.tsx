import { FormEvent, useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveAdminToken, validateAdminAccess, validateTrainerSession } from "@/lib/api";

// Page Imports
import Landing from "./pages/landing";
import TrainerLogin from "./pages/trainer-login";
import ParticipantProfile from "./pages/participant-profile";
import ParticipantTestCode from "./pages/participant-test-code";
import Dashboard from "./pages/dashboard";
import Tests from "./pages/tests";
import Reports from "./pages/reports";
import ReportDetail from "./pages/report-detail";
import InterviewJoin from "./pages/interview/join";
import InterviewSession from "./pages/interview/session";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function AdminGate({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "locked">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    validateAdminAccess()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("locked"));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!adminKey.trim()) {
      setError("Admin key is required.");
      return;
    }

    try {
      await validateAdminAccess(adminKey);
      saveAdminToken(adminKey);
      setStatus("ready");
    } catch (err) {
      setError((err as Error).message || "Invalid admin key.");
    }
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "ready") {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="glass-panel w-full max-w-md border-border/80">
        <CardHeader className="text-center">
          <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="U-Next" className="mx-auto mb-4 h-12 w-auto" />
          <CardTitle>Admin Center</CardTitle>
          <CardDescription>Enter the admin key to manage trainer credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-key" className="text-sm font-medium">Admin key</label>
              <Input
                id="admin-key"
                type="password"
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                aria-describedby={error ? "admin-key-error" : undefined}
              />
            </div>
            {error && <p id="admin-key-error" className="text-sm font-medium text-destructive" role="alert">{error}</p>}
            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function TrainerGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ready" | "locked">("checking");

  useEffect(() => {
    validateTrainerSession()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("locked"));
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "ready") {
    return <>{children}</>;
  }

  return <TrainerLogin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/trainer-login" component={TrainerLogin} />
      <Route path="/participant" component={ParticipantProfile} />
      <Route path="/participant/test-code" component={ParticipantTestCode} />

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminGate><Dashboard /></AdminGate>
      </Route>

      {/* Trainer Routes */}
      <Route path="/trainer">
        <TrainerGate><Dashboard /></TrainerGate>
      </Route>
      <Route path="/trainer/tests">
        <TrainerGate><Tests /></TrainerGate>
      </Route>
      <Route path="/trainer/reports">
        <TrainerGate><Reports /></TrainerGate>
      </Route>
      <Route path="/trainer/reports/:id">
        <TrainerGate><ReportDetail /></TrainerGate>
      </Route>
      
      {/* Candidate Routes */}
      <Route path="/join/:inviteToken" component={InterviewJoin} />
      <Route path="/interview/:id/session" component={InterviewSession} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
