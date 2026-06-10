import { TrainerLayout } from "@/components/layout/TrainerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListReports, useListTests } from "@/lib/api";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, ChevronRight, BarChart3, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const [selectedTestId, setSelectedTestId] = useState<string>("all");
  const activeTestId = selectedTestId === "all" ? undefined : Number(selectedTestId);
  const { data: reports, isLoading: reportsLoading } = useListReports(activeTestId);
  const { data: tests, isLoading: testsLoading } = useListTests(true);
  const [search, setSearch] = useState("");
  
  const filtered = (reports || []).filter((report) => 
    report.candidateName.toLowerCase().includes(search.toLowerCase())
  );

  const formatSeconds = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) return "N/A";
    if (value < 60) return `${value.toFixed(1)}s`;
    const minutes = Math.floor(value / 60);
    const seconds = Math.round((value % 60) * 10) / 10;
    return `${minutes} min ${seconds.toFixed(1)}s`;
  };

  const downloadScenarioReport = () => {
    if (selectedTestId === "all" || filtered.length === 0) return;

    const selectedTest = tests?.find((test) => test.id === Number(selectedTestId));
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filtered.map((report) => {
      const rubricSummary = report.scoreBreakdown
        .map((item) => `${item.criterion}: ${item.score}/${item.maxScore} - ${item.justification}`)
        .join(" | ");

      return [
        report.candidateName,
        `${report.totalScore}/${report.maxScore}`,
        rubricSummary,
        report.overallJustification,
        formatSeconds(report.timeSpentSeconds),
        report.completedAt ? format(new Date(report.completedAt), "yyyy-MM-dd HH:mm") : "",
      ]
        .map((value) => escapeCell(String(value)))
        .join(",");
    });

    const csv = [
      ["Student Name", "Marks", "Justification", "Overall Summary", "Time Spent", "Completed At"]
        .map(escapeCell)
        .join(","),
      ...rows,
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(selectedTest?.title || "scenario-report").replace(/[^\w.-]+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (reportsLoading || testsLoading) {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold">Evaluation Reports</h1>
          <p className="text-muted-foreground mt-2">Review AI-generated scoring and feedback for candidates.</p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger className="w-full bg-card/50 border-white/10 md:w-72">
              <SelectValue placeholder="Filter by scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All scenarios</SelectItem>
              {tests?.map((test) => (
                <SelectItem key={test.id} value={String(test.id)}>
                  {test.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input 
              placeholder="Search candidates..." 
              className="pl-9 bg-card/50 border-white/10 focus-visible:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={downloadScenarioReport}
            disabled={selectedTestId === "all" || filtered.length === 0}
            className="bg-primary text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Test Scenario</th>
                <th className="px-6 py-4 font-medium">Time Spent</th>
                <th className="px-6 py-4 font-medium">Date Completed</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => {
                const test = tests?.find((item) => item.id === report.testId);
                return (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {report.candidateName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {test?.title || report.testTitle}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatSeconds(report.timeSpentSeconds)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {report.completedAt ? format(new Date(report.completedAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/reports/${report.interviewId}`} className="inline-flex items-center text-primary font-medium hover:text-primary/80">
                        View Report <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No completed evaluations found.</p>
            </div>
          )}
        </div>
      </Card>
    </TrainerLayout>
  );
}
