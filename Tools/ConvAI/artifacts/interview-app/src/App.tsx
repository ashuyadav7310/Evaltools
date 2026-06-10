import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
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

function Router() {
  return (
    <Switch>
      {/* Trainer Routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/tests" component={Tests} />
      <Route path="/reports" component={Reports} />
      <Route path="/reports/:id" component={ReportDetail} />
      
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
