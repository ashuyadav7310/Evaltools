import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getParticipantProfile, saveParticipantProfile } from "@/lib/api";

export default function ParticipantProfile() {
  const [, setLocation] = useLocation();
  const existingProfile = getParticipantProfile();
  const [name, setName] = useState(existingProfile?.name ?? "");
  const [email, setEmail] = useState(existingProfile?.email ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    setError("");
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    saveParticipantProfile({ name: trimmedName, email: trimmedEmail });
    setLocation("/participant/test-code");
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
            <CardTitle className="text-2xl">Participant Portal</CardTitle>
            <CardDescription>Enter your details before joining a live ConvAI test.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="participant-name" className="text-sm font-medium">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="participant-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 pl-10"
                    autoComplete="name"
                    aria-describedby={error ? "participant-profile-error" : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="participant-email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="participant-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 pl-10"
                    autoComplete="email"
                    aria-describedby={error ? "participant-profile-error" : undefined}
                  />
                </div>
              </div>
              {error && (
                <p id="participant-profile-error" className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="h-12 w-full gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
