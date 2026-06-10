import { TrainerLayout } from "@/components/layout/TrainerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useListTests, useListInterviews } from "@/lib/api";
import { FileText, Users, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: tests, isLoading: testsLoading } = useListTests(true);
  const { data: interviews, isLoading: interviewsLoading } = useListInterviews(true);

  const activeInterviews = interviews?.filter(i => i.status === 'in_progress') || [];
  const completedInterviews = interviews?.filter(i => i.status === 'completed') || [];

  const stats = [
    { label: "Total Tests", value: tests?.length || 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Sessions", value: activeInterviews.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Completed Evaluations", value: completedInterviews.length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Candidates", value: interviews?.length || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  if (testsLoading || interviewsLoading) {
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-4xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Overview of your AI conversational-agent operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-panel border-0 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 min-h-[160px] flex items-center justify-between relative z-10">
                  <div className="flex min-h-[88px] flex-col justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-display font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-panel border-0">
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Latest candidate sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews?.slice(0, 5).map((interview) => {
                  const test = tests?.find(t => t.id === interview.testId);
                  return (
                    <div key={interview.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">{interview.candidateName}</p>
                        <p className="text-sm text-muted-foreground">{test?.title || 'Unknown Test'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${interview.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                            interview.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-blue-500/10 text-blue-400'}`}>
                          {interview.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(interview.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(!interviews || interviews.length === 0) && (
                  <div className="text-center p-8 text-muted-foreground">
                    No conversations yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-0 relative overflow-hidden">
            {/* abstract graphic in background */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <CardHeader className="relative z-10">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get started</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
               <Link href="/tests" className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 hover:from-primary/30 hover:to-primary/10 transition-all cursor-pointer group">
                  <div className="bg-primary/20 p-3 rounded-lg text-primary group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create New Test</h3>
                    <p className="text-sm text-muted-foreground">Design a new conversation scenario and rubric.</p>
                  </div>
               </Link>
               <Link href="/reports" className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 hover:from-purple-500/30 hover:to-purple-500/10 transition-all cursor-pointer group">
                  <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Reports</h3>
                    <p className="text-sm text-muted-foreground">Analyze candidate performance data.</p>
                  </div>
               </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </TrainerLayout>
  );
}
