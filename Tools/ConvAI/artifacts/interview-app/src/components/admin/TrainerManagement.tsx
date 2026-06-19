import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getListTrainersQueryKey, useCreateTrainer, useListTrainers, useUpdateTrainer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function TrainerManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: trainers, isLoading } = useListTrainers();
  const createTrainer = useCreateTrainer();
  const updateTrainer = useUpdateTrainer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListTrainersQueryKey() });

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Trainer email ID is required.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    createTrainer.mutate(
      { data: { email, password } },
      {
        onSuccess: () => {
          setEmail("");
          setPassword("");
          refresh();
          toast({ title: "Trainer account created" });
        },
        onError: (err) => setError(err.message || "Failed to create trainer account."),
      },
    );
  };

  const toggleStatus = (id: number, isActive: boolean) => {
    updateTrainer.mutate(
      { id, data: { status: isActive ? "active" : "inactive" } },
      {
        onSuccess: () => {
          refresh();
          toast({ title: isActive ? "Trainer activated" : "Trainer deactivated" });
        },
        onError: (err) => toast({ title: err.message || "Failed to update trainer", variant: "destructive" }),
      },
    );
  };

  return (
    <Card className="glass-panel border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Trainer Credential Management
        </CardTitle>
        <CardDescription>Create trainer login IDs and activate or deactivate access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <label htmlFor="new-trainer-email" className="text-sm font-medium">Trainer email ID</label>
            <Input
              id="new-trainer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="trainer@example.com"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-trainer-password" className="text-sm font-medium">Password</label>
            <Input
              id="new-trainer-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="mt-0 gap-2 md:mt-8" disabled={createTrainer.isPending}>
            <Plus className="h-4 w-4" />
            {createTrainer.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
        {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Access</th>
              </tr>
            </thead>
            <tbody>
              {trainers?.map((trainer) => {
                const active = trainer.status === "active";
                return (
                  <tr key={trainer.id} className="border-b border-border/70 last:border-b-0">
                    <td className="px-4 py-3 font-medium">{trainer.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Switch
                        checked={active}
                        onCheckedChange={(checked) => toggleStatus(trainer.id, checked)}
                        aria-label={`${active ? "Deactivate" : "Activate"} ${trainer.email}`}
                      />
                    </td>
                  </tr>
                );
              })}
              {!isLoading && (!trainers || trainers.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No trainer accounts yet.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    Loading trainers...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
