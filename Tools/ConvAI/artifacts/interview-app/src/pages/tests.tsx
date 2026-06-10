import { useState } from "react";
import { TrainerLayout } from "@/components/layout/TrainerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListTests, useCreateInvite, useCreateTest, useDeleteTest, getListTestsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, FileText, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const testSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  participantContext: z.string().min(10, "Participant context must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  inputMode: z.enum(["audio", "text"]),
  context: z.string().min(10, "Context must be at least 10 characters"),
  rubrics: z.array(z.object({
    name: z.string().min(1, "Name required"),
    description: z.string().optional()
  })).min(1, "At least one rubric required")
});

export default function Tests() {
  const { data: tests, isLoading } = useListTests(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTest = useCreateTest();
  const deleteTest = useDeleteTest();
  const createInvite = useCreateInvite();

  const form = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: "",
      participantContext: "",
      category: "leadership",
      inputMode: "audio",
      context: "",
      rubrics: [{ name: "Communication", description: "Clarity and tone" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rubrics"
  });

  const onSubmit = (data: z.infer<typeof testSchema>) => {
    createTest.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
        setIsCreateOpen(false);
        form.reset();
        toast({ title: "Test created successfully" });
      },
      onError: (err) => {
        toast({ title: "Failed to create test", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if(confirm("Are you sure you want to delete this test?")) {
      deleteTest.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
          toast({ title: "Test deleted" });
        }
      });
    }
  };

  const copyInterviewLink = (id: number) => {
    createInvite.mutate(
      { data: { testId: id, maxAttempts: 1 } },
      {
        onSuccess: (invite) => {
          const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
          const path = `${base}/join/${invite.inviteToken}`.replace(/^\/\//, "/");
          const url = `${window.location.origin}${path}`;
          navigator.clipboard.writeText(url);
          toast({ title: "One-time invite link copied to clipboard!" });
        },
        onError: () => {
          toast({ title: "Failed to create invite", variant: "destructive" });
        },
      },
    );
  };

  const getCategoryLabel = (category: string) => {
    const normalized = category?.toLowerCase().replace(/\s+/g, "_");
    if (normalized === "leadership") return "Leadership & Behavioral";
    if (normalized === "hiring_process") return "Hiring Process";
    if (normalized === "interviewer_evaluation") return "Interviewer Evaluation";
    return category;
  };

  return (
    <TrainerLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold">Conversation Tests</h1>
          <p className="text-muted-foreground mt-2">Manage your AI conversation scenarios</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all px-6">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-card border-white/10 glass-panel max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Create New Scenario</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Customer Conflict" className="bg-background/50 border-white/10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-white/10">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="leadership">Leadership & Behavioral</SelectItem>
                          <SelectItem value="hiring_process">Hiring Process</SelectItem>
                          <SelectItem value="interviewer_evaluation">Interviewer Evaluation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="inputMode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participant Input Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-white/10">
                          <SelectValue placeholder="Select input mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="audio">Audio (microphone)</SelectItem>
                        <SelectItem value="text">Text (typed input)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="participantContext" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participant Context (Shown to Candidate)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a clear summary so the participant understands what the conversation is about..."
                        className="h-24 bg-background/50 border-white/10 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="context" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario Context (AI Prompt - Internal)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide the full detailed context, conditions, and adaptive logic the AI should follow..." 
                        className="h-32 bg-background/50 border-white/10 resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Evaluation Rubrics</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", description: "" })} className="border-white/10 h-8">
                      <Plus className="w-3 h-3 mr-1" /> Add Criterion
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-start">
                        <FormField control={form.control} name={`rubrics.${index}.name`} render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Criterion Name (e.g. Empathy)" className="bg-background/50 border-white/10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`rubrics.${index}.description`} render={({ field }) => (
                          <FormItem className="flex-[2]">
                            <FormControl>
                              <Input placeholder="Description / Guidelines" className="bg-background/50 border-white/10" {...field} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => remove(index)} disabled={fields.length === 1}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={createTest.isPending}>
                    {createTest.isPending ? "Creating..." : "Create Test"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="h-64 animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tests?.map((test) => (
              <motion.div
                key={test.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-panel border-0 h-full flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="bg-primary/20 p-2.5 rounded-lg text-primary mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                        {getCategoryLabel(test.category)}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {test.participantContext || test.context}
                    </p>
                    <div className="mt-4 flex gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Rubrics</span>
                        <span className="font-semibold">{test.rubrics.length}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Input</span>
                        <span className="font-semibold capitalize">{test.inputMode}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-white/5 pt-4 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-transparent border-white/10 hover:bg-white/5"
                      onClick={() => copyInterviewLink(test.id)}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {tests?.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No tests found</h3>
              <p className="text-muted-foreground mb-4">Create your first conversation scenario to get started.</p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-primary text-white">Create Test</Button>
            </div>
          )}
        </div>
      )}
    </TrainerLayout>
  );
}
