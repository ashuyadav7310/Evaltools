import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getParticipantProfile, saveInviteToken, useStartInviteInterview, validateInviteCode } from "@/lib/api";

export default function ParticipantTestCode() {
  const [, setLocation] = useLocation();
  const [testCode, setTestCode] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const startInviteInterview = useStartInviteInterview();
  const profile = getParticipantProfile();

  useEffect(() => {
    if (!profile) {
      setLocation("/participant");
    }
  }, [profile, setLocation]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const code = testCode.trim();
    setError("");

    if (!profile) {
      setLocation("/participant");
      return;
    }
    if (!code) {
      setError("Test code is required.");
      return;
    }

    setIsChecking(true);
    try {
      await validateInviteCode(code);
      startInviteInterview.mutate(
        {
          inviteToken: code,
          data: {
            candidateName: profile.name,
            candidateEmail: profile.email,
          },
        },
        {
          onSuccess: (result) => {
            saveInviteToken(code);
            setLocation(`/interview/${result.interview.id}/session`);
          },
          onError: (err) => setError(err.message || "Unable to start this test."),
        },
      );
    } catch (err) {
      setError((err as Error).message || "Invalid or inactive test code.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/participant" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to details
        </Link>
        <Card className="glass-panel border-border/80">
          <CardHeader className="text-center">
            <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="U-Next" className="mx-auto mb-4 h-12 w-auto" />
            <CardTitle className="text-2xl">Enter Test Code</CardTitle>
            <CardDescription>Use the active code shared by your trainer to start the test.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="participant-test-code" className="text-sm font-medium">Test code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="participant-test-code"
                    value={testCode}
                    onChange={(event) => setTestCode(event.target.value)}
                    className="h-12 pl-10"
                    aria-describedby={error ? "participant-test-code-error" : undefined}
                    autoComplete="off"
                  />
                </div>
              </div>
              {error && (
                <p id="participant-test-code-error" className="text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="h-12 w-full gap-2" disabled={isChecking || startInviteInterview.isPending}>
                {isChecking || startInviteInterview.isPending ? "Starting..." : "Start Test"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
