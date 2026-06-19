import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trainerLogin } from "@/lib/api";

export default function TrainerLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email ID is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await trainerLogin({ email, password });
      setLocation("/trainer");
    } catch (err) {
      setError((err as Error).message || "Invalid email ID or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to ConvAI
        </Link>
        <Card className="glass-panel border-border/80">
          <CardHeader className="text-center">
            <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="U-Next" className="mx-auto mb-4 h-12 w-auto" />
            <CardTitle className="text-2xl">Trainer Login</CardTitle>
            <CardDescription>Use the email ID and password created by the Admin Center.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="trainer-email" className="text-sm font-medium">Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="trainer-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 pl-10"
                    autoComplete="email"
                    aria-describedby={error ? "trainer-login-error" : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="trainer-password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="trainer-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 pl-10"
                    autoComplete="current-password"
                    aria-describedby={error ? "trainer-login-error" : undefined}
                  />
                </div>
              </div>
              {error && (
                <p id="trainer-login-error" className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
