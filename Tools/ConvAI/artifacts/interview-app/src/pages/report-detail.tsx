import { useParams, Link, useLocation } from "wouter";
import { TrainerLayout } from "@/components/layout/TrainerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasAdminToken, hasTrainerSession, useGetReport } from "@/lib/api";
import { ArrowLeft, CheckCircle2, TrendingUp, FileText, User, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Using native HTML/SVG for simple beautiful bar charts to avoid heavy recharts logic for simple needs
function ScoreBar({ label, score, max }: { label: string, score: number, max: number }) {
  const percentage = (score / max) * 100;
  // Color logic based on score
  const colorClass = percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-blue-500" : "bg-amber-500";
  
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-xl font-bold font-display">{score}<span className="text-sm text-muted-foreground font-normal">/{max}</span></span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
          style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }}
        />
      </div>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const [location] = useLocation();
  const basePath = location.startsWith("/admin") ? "/admin" : "/trainer";
  const { data: report, isLoading, isError } = useGetReport(parseInt(id || "0"));

  if (!hasTrainerSession() && !hasAdminToken()) {
    return (
      <TrainerLayout>
        <div className="text-center py-20 text-muted-foreground">Sign in to view reports.</div>
      </TrainerLayout>
    );
  }

  if (isLoading) {
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </TrainerLayout>
    );
  }

  if (isError || !report) {
    return (
      <TrainerLayout>
        <div className="text-center py-20 text-destructive">Report not found or error loading.</div>
      </TrainerLayout>
    );
  }

  const overallPercentage = (report.totalScore / report.maxScore) * 100;
  const normalizedOverallPercentage = Math.max(0, Math.min(100, 
    Number.isFinite(overallPercentage) ? overallPercentage : 0
  ));

  const formatSeconds = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) return "N/A";
    if (value < 60) return `${value.toFixed(1)}s`;
    const minutes = Math.floor(value / 60);
    const seconds = Math.round((value % 60) * 10) / 10;
    return `${minutes} min ${seconds.toFixed(1)}s`;
  };

  return (
    <TrainerLayout>
      <div className="mb-6">
        <Link href={`${basePath}/reports`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reports
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">{report.candidateName}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4" /> {report.testTitle}
              <span className="mx-2">•</span>
              {format(new Date(report.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Score</p>
              <div className="text-3xl font-display font-bold text-primary">
                {report.totalScore.toFixed(1)} <span className="text-lg text-muted-foreground">/ {report.maxScore}</span>
              </div>
            </div>
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${normalizedOverallPercentage}%, hsl(var(--border)) ${normalizedOverallPercentage}% 100%)`,
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card">
                <span className="text-sm font-bold">{Number.isFinite(normalizedOverallPercentage) ? Math.round(normalizedOverallPercentage) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Scores */}
        <Card className="glass-panel border-0 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-2">
              {report.scoreBreakdown.map((b, i) => (
                <div key={i}>
                  <ScoreBar label={b.criterion} score={b.score} max={b.maxScore} />
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                    {b.justification}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Feedback */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Card className="glass-panel border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Time Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-display font-bold">{formatSeconds(report.timeSpentSeconds)}</p>
              </CardContent>
            </Card>
          </div>

          {/* <Card className="glass-panel border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Overall Justification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed text-lg">
                {report.overallJustification}
              </p>
            </CardContent>
          </Card> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-panel border-0 border-t-4 border-t-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mt-4">
                  {report.strengths.map((str, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {str}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* <Card className="glass-panel border-0 border-t-4 border-t-rose-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-rose-500">
                  <XCircle className="w-5 h-5" />
                  Key Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mt-4">
                  {report.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card> */}

            <Card className="glass-panel border-0 border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                  <TrendingUp className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mt-4">
                  {report.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TrainerLayout>
  );
}
