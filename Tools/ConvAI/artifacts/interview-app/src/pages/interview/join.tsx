import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveInviteToken, useStartInviteInterview, useValidateInvite } from "@/lib/api";
import { ArrowRight, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewJoin() {
  const { inviteToken } = useParams();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const token = (inviteToken || "").trim();
  const { data: inviteValidation, isLoading, isError, error } = useValidateInvite(token);
  const startInviteInterview = useStartInviteInterview();
  const test = inviteValidation?.test;

  const categoryLabel = (() => {
    const normalized = test?.category?.toLowerCase().replace(/\s+/g, "_");
    if (normalized === "leadership") return "Leadership & Behavioral";
    if (normalized === "hiring_process") return "Hiring Process";
    if (normalized === "interviewer_evaluation") return "Interviewer Evaluation";
    return test?.category ?? "";
  })();

  const isInterviewerEvaluation = test?.category?.toLowerCase().replace(/\s+/g, "_") === "interviewer_evaluation";
  const isTextInputMode = test?.inputMode === "text";

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    setFormError("");
    if (!trimmedName) {
      setFormError("Name is required.");
      return;
    }
    if (!trimmedEmail) {
      setFormError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!token) return;

    startInviteInterview.mutate({
      inviteToken: token,
      data: { candidateName: trimmedName, candidateEmail: trimmedEmail }
    }, {
      onSuccess: (result) => {
        saveInviteToken(token);
        setLocation(`/interview/${result.interview.id}/session`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !test) {
    const apiMessage = (error as Error | undefined)?.message ?? "";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Invite unavailable</h1>
        <p className="text-muted-foreground">{apiMessage || "Please check the invitation link and try again."}</p>
      </div>
    );
  }

  if (!inviteValidation?.activeInterview && !inviteValidation?.canStartNew) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">No attempts remaining</h1>
        <p className="text-muted-foreground">This invitation has already been used the maximum number of times.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="uNext" className="h-14 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground mt-2">AI-Powered Conversational Agent</p>
        </div>

        <Card className="bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50">
          <CardHeader className="text-center border-b border-white/5 pb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-muted-foreground mb-3 border border-white/10">
              {categoryLabel}
            </div>
            <CardTitle className="text-2xl">{test.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {isInterviewerEvaluation
                ? `You will conduct an open-ended interview. Ask questions and the AI candidate will respond until you choose to end the session. Your interviewing quality will be evaluated automatically.`
                : `This conversation is open-ended and will continue until you end the session. It will be evaluated automatically.`}
            </CardDescription>
            {test.participantContext && (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-left">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Context</p>
                <p className="text-sm text-foreground/90 whitespace-pre-line">{test.participantContext}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="direct-participant-name" className="text-sm font-medium text-foreground ml-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    id="direct-participant-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe" 
                    className="pl-10 py-6 bg-background/50 border-white/10 text-lg focus-visible:ring-primary/50 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="direct-participant-email" className="text-sm font-medium text-foreground ml-1">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="direct-participant-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jane@example.com"
                    className="pl-10 py-6 bg-background/50 border-white/10 text-lg focus-visible:ring-primary/50 transition-all"
                    required
                  />
                </div>
              </div>
              {formError && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all group"
                disabled={startInviteInterview.isPending || !name.trim() || !email.trim()}
              >
                {startInviteInterview.isPending ? "Starting..." : "Start Conversation"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                {isTextInputMode
                  ? "Note: This conversation uses typed text input."
                  : "Note: This conversation requires microphone access."}
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
