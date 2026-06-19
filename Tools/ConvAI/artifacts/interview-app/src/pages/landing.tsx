import { Link } from "wouter";
import { ArrowRight, Play, ShieldCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trainerPills = [
  "Create Test",
  "Generate Test Code",
  "View Participant Evaluations",
  "Download Reports by Test Code",
  "Activate/Deactivate Test Code",
];

const participantPills = ["Test Code", "Rubrics", "Evaluation", "Live Assessment"];

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="ConvAI">
          <Link href="/" className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="U-Next" className="h-9 w-auto" />
            <span className="sr-only">U-Next ConvAI</span>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Admin Center
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
        <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/10 text-primary">
          AI-Powered Conversational Assessment
        </Badge>
        <h1 className="max-w-3xl text-4xl font-display font-bold sm:text-5xl lg:text-6xl">
          Welcome to ConvAI
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Trainers can manage tests, evaluations, and reports, while admins manage trainer access.
        </p>

        <div className="mt-10 grid w-full gap-6 text-left lg:grid-cols-2">
          <Card className="glass-panel overflow-hidden border-border/80">
            <CardContent className="flex h-full flex-col p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UsersRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Trainer Portal</h2>
                </div>
                <Badge className="bg-primary text-primary-foreground">Trainer Access</Badge>
              </div>
              <p className="mt-4 text-muted-foreground">Create trainer credentials and control trainer access.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {trainerPills.map((pill) => (
                  <span key={pill} className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {pill}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link href="/trainer-login" className="sm:col-span-2">
                  <Button className="w-full gap-2">
                    Go to trainer portal
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel overflow-hidden border-border/80">
            <CardContent className="flex h-full flex-col p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Play className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">Participant Portal</h2>
                </div>
                <Badge className="bg-emerald-600 text-white">Live Test Access</Badge>
              </div>
              <p className="mt-4 text-muted-foreground">Enter your details, verify your test code, and join an active live test.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {participantPills.map((pill) => (
                  <span key={pill} className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {pill}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/participant">
                  <Button className="h-12 w-full gap-2 whitespace-nowrap">
                    Go to participant portal
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-10 text-sm text-muted-foreground">
          Need help? Contact your trainer or U-Next support.
        </footer>
      </section>
    </main>
  );
}
