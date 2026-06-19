import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { 
  useGetInterview, 
  useGetNextQuestion, 
  useProcessTurn,
  useProcessTextTurn,
  useTextToSpeech,
  useEndSession 
} from "@/lib/api";
import { useAudioRecorder } from "@/hooks/use-audio";
import { playBase64Audio } from "@/lib/audio-utils";
import { Mic, Square, Loader2, BrainCircuit, CheckCircle2, AlertTriangle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function InterviewSession() {
  const { id } = useParams();
  const interviewId = parseInt(id || "0");

  const { data: interview, isLoading: initLoading } = useGetInterview(interviewId);
  const getNextQ = useGetNextQuestion();
  const processTurn = useProcessTurn();
  const processTextTurn = useProcessTextTurn();
  const tts = useTextToSpeech();
  const endSession = useEndSession();

  const { startRecording, stopRecording } = useAudioRecorder();
  const turnStartedAtRef = useRef<number | null>(null);
  const aiPromptTtsStartedAtRef = useRef<number | null>(null);
  const firstTypingAtRef = useRef<number | null>(null);
  const currentTurnAiListeningSecondsRef = useRef<number>(0);

  // State machine for interview flow
  const [status, setStatus] = useState<
    'initializing' | 'fetching_question' | 'ai_speaking' | 'waiting' | 'recording' | 'processing' | 'completed' | 'error'
  >('initializing');
  
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [transcript, setTranscript] = useState("");
  const [interviewerTranscript, setInterviewerTranscript] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isTextOnlyMode, setIsTextOnlyMode] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTextOnlyMode(window.localStorage.getItem("candidate_text_only_mode") === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("candidate_text_only_mode", String(isTextOnlyMode));
  }, [isTextOnlyMode]);
  
  // Start flow once interview is loaded
  useEffect(() => {
    if (interview && status === 'initializing') {
      // If already completed in DB, just show complete screen
      if (interview.status === 'completed') {
        setStatus('completed');
        return;
      }
      
      // Fetch first question
      fetchNextQuestion(null);
    }
  }, [interview, status]);

  useEffect(() => {
    if (status === 'waiting') {
      turnStartedAtRef.current = Date.now();
    }
  }, [status, currentQuestion, currentRound]);

  const resetTurnListeningTracking = () => {
    aiPromptTtsStartedAtRef.current = null;
    firstTypingAtRef.current = null;
    currentTurnAiListeningSecondsRef.current = 0;
  };

  const getCurrentTurnAiListeningSeconds = () => {
    const value = Math.max(currentTurnAiListeningSecondsRef.current, 0);
    return Math.round(value * 100) / 100;
  };

  const playPromptAudioAndTrackListening = async (text: string) => {
    setIsAiSpeaking(true);
    try {
      const ttsResp = await tts.mutateAsync({
        id: interviewId,
        data: { text },
      });
      const playbackStartedAt = performance.now();
      aiPromptTtsStartedAtRef.current = playbackStartedAt;
      const ttsDurationSeconds = await playBase64Audio(ttsResp.audio, ttsResp.format || 'mp3');

      const firstTypingAt = firstTypingAtRef.current;
      if (firstTypingAt == null) {
        currentTurnAiListeningSecondsRef.current = ttsDurationSeconds;
        return;
      }

      const secondsUntilTyping = Math.max((firstTypingAt - playbackStartedAt) / 1000, 0);
      currentTurnAiListeningSecondsRef.current = Math.min(secondsUntilTyping, ttsDurationSeconds);
    } catch (e) {
      console.error("TTS failed, falling back to text only", e);
      currentTurnAiListeningSecondsRef.current = 0;
    } finally {
      aiPromptTtsStartedAtRef.current = null;
      setIsAiSpeaking(false);
    }
  };

  const fetchNextQuestion = async (lastResponse: string | null) => {
    setStatus('fetching_question');
    setErrorMessage("");
    try {
      const qResp = await getNextQ.mutateAsync({ 
        id: interviewId, 
        data: { candidateResponse: lastResponse } 
      });

      setCurrentQuestion(qResp.question);

      if (qResp.isComplete) {
        await handleEndSession();
      } else {
        resetTurnListeningTracking();
        setCurrentRound(qResp.round);
        setStatus('waiting');
        if (!isTextOnlyMode && !isInterviewerEvaluation) {
          void playPromptAudioAndTrackListening(qResp.question);
        } else {
          setIsAiSpeaking(false);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMessage(e instanceof Error ? e.message : "Unable to fetch the next question.");
      setStatus('error');
    }
  };

  const isInterviewerEvaluation = interview?.test?.category?.toLowerCase().replace(/\s+/g, "_") === "interviewer_evaluation";
  const isTextInputMode = interview?.test?.inputMode === "text";

  const handleTurnProcessed = async (turnResp: { transcript: string; interviewerQuestion?: string; question: string; round: number; isComplete: boolean; }) => {
    setTranscript(turnResp.transcript);
    setIsAiSpeaking(false);
    if (isInterviewerEvaluation && turnResp.interviewerQuestion) {
      setInterviewerTranscript(turnResp.interviewerQuestion);
    }

    if (!isInterviewerEvaluation) {
      setCurrentQuestion(turnResp.question);
    }

    if (turnResp.isComplete) {
      await handleEndSession();
      return;
    }

    resetTurnListeningTracking();
    setCurrentRound(turnResp.round);
    setStatus('waiting');
    if (!isTextOnlyMode && (isInterviewerEvaluation ? !!turnResp.transcript : true)) {
      const promptText = isInterviewerEvaluation ? turnResp.transcript : turnResp.question;
      void playPromptAudioAndTrackListening(promptText);
    }
  };

  const handleToggleRecording = async () => {
    if (status === 'waiting') {
      try {
        await startRecording();
        setStatus('recording');
        setTranscript("");
        setInterviewerTranscript("");
        setErrorMessage("");
      } catch (e) {
        console.error(e);
        setErrorMessage(e instanceof Error ? e.message : "Unable to access the microphone.");
        setStatus('error');
      }
    } else if (status === 'recording') {
      setStatus('processing');
      try {
        const recording = await stopRecording();
        const responseDurationSeconds = recording.durationSeconds;

        // Single round-trip: transcribe + save response + generate next question
        const turnResp = await processTurn.mutateAsync({
          id: interviewId,
          data: {
            audio: recording.audioBase64,
            mimeType: recording.mimeType,
            question: currentQuestion,
            round: currentRound,
            responseDurationSeconds,
            aiSpeakingDurationSeconds: getCurrentTurnAiListeningSeconds(),
          }
        });

        await handleTurnProcessed(turnResp);

      } catch (e) {
        console.error(e);
        setErrorMessage(e instanceof Error ? e.message : "Unable to process your response.");
        setStatus('error');
      }
    }
  };

  const handleSubmitTypedInput = async () => {
    const text = typedInput.trim();
    if (!text || status !== 'waiting') return;

    setStatus('processing');
    setErrorMessage("");
    setTranscript("");
    setInterviewerTranscript("");
    try {
      const responseDurationSeconds = turnStartedAtRef.current
        ? Math.max((Date.now() - turnStartedAtRef.current) / 1000, 0)
        : undefined;
      const turnResp = await processTextTurn.mutateAsync({
        id: interviewId,
        data: {
          transcript: text,
          question: currentQuestion,
          round: currentRound,
          responseDurationSeconds,
          aiSpeakingDurationSeconds: getCurrentTurnAiListeningSeconds(),
        },
      });
      setTypedInput("");
      await handleTurnProcessed(turnResp);
    } catch (e) {
      console.error(e);
      setErrorMessage(e instanceof Error ? e.message : "Unable to process your response.");
      setStatus('error');
    }
  };

  const handleEndSession = async () => {
    if (isEndingSession || endSession.isPending) return;
    setIsEndingSession(true);
    setStatus('processing');
    try {
      await endSession.mutateAsync({ id: interviewId });
      setStatus('completed');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unable to complete the conversation.");
      setStatus('error');
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleTypedInputChange = (value: string) => {
    setTypedInput(value);
    if (status !== 'waiting') return;
    if (firstTypingAtRef.current != null) return;
    if (!value.trim()) return;

    firstTypingAtRef.current = performance.now();
  };

  if (initLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">Session Complete</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {interview?.test?.category?.toLowerCase().replace(/\s+/g, "_") === "interviewer_evaluation"
              ? `Thank you, ${interview?.candidateName}. Your interview session has been recorded and your interviewer evaluation report is being generated.`
              : `Thank you, ${interview?.candidateName}. Your responses have been recorded and will be evaluated shortly.`}
          </p>
          <p className="text-sm text-muted-foreground">You may now close this window.</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="mb-3 text-3xl font-display font-bold">Conversation Paused</h1>
          <p className="mb-6 text-muted-foreground">
            {errorMessage || "Something went wrong while running the conversation."}
          </p>
          <button
            onClick={() => fetchNextQuestion(transcript || null)}
            className="rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const participantContext = interview?.test?.participantContext || "";

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Dynamic Background based on state */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 ease-in-out z-0 flex items-center justify-center">
         {status === 'recording' && (
           <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-red-500/5 rounded-full blur-[100px] animate-pulse" />
         )}
         {isAiSpeaking && (
           <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
         )}
      </div>

      <header className="p-6 flex justify-between items-center relative z-20 border-b border-white/5 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-1">
          <img src={`${import.meta.env.BASE_URL}images/UNext_Logo.png`} alt="uNext" className="h-8 w-auto" />
          <span className="font-display font-bold tracking-wide hidden md:inline"><span className="text-muted-foreground font-normal ml-2">| {interview?.test?.title}</span></span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setIsContextOpen(!isContextOpen)}
            className="lg:hidden flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
            title="Show context"
          >
            {isContextOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Skip Voice / Text-only</span>
            <span className="text-xs font-medium text-muted-foreground sm:hidden">Text-only</span>
            <Switch
              checked={isTextOnlyMode}
              onCheckedChange={(checked) => {
                setIsTextOnlyMode(checked);
                if (checked) {
                  setIsAiSpeaking(false);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Turn</span>
            <div className="font-bold font-display text-sm">{currentRound}</div>
          </div>
          <button
            onClick={handleEndSession}
            disabled={status === 'recording' || status === 'processing' || status === 'completed' || isEndingSession || endSession.isPending}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            End Session
          </button>
          </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden relative z-10">
        <AnimatePresence>
          {isContextOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsContextOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="fixed left-0 top-[80px] w-80 h-[calc(100vh-80px)] bg-background border-r border-white/5 z-50 overflow-y-auto lg:hidden"
              >
                {participantContext && (
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-5 bg-primary rounded-full" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Context</h3>
                    </div>
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                    >
                      <p className="text-sm leading-relaxed text-foreground/90 font-medium">{participantContext}</p>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex lg:w-80 flex-col border-r border-white/5 bg-white/2 backdrop-blur-sm overflow-y-auto"
        >
          {participantContext && (
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Context</h3>
              </div>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:border-primary/40 transition-colors"
              >
                <p className="text-sm leading-relaxed text-foreground/90 font-medium">{participantContext}</p>
              </motion.div>
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Candidate</p>
                  <p className="text-foreground/90 font-medium">{interview?.candidateName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Current Turn</p>
                  <p className="text-foreground/90 font-medium">{currentRound}</p>
                </div>
              </div>
            </div>
          )}
        </motion.aside>

        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 w-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {['fetching_question', 'processing', 'initializing'].includes(status) ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="mt-6 text-lg text-muted-foreground font-medium text-center">
                  {status === 'processing'
                    ? (isInterviewerEvaluation ? "Processing your question and generating response..." : "Processing your response...")
                    : (isInterviewerEvaluation ? "Preparing the interview..." : "Preparing your next question...")}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="interaction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center max-w-2xl mx-auto"
              >
                <div className="text-center mb-12 md:mb-16 w-full">
                  {!isInterviewerEvaluation && (
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-medium leading-tight text-foreground/90">
                      "{currentQuestion}"
                    </h2>
                  )}
                  {isAiSpeaking && (
                    <p className="text-primary mt-6 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold">
                      <span className="flex gap-1 h-3 items-center">
                        <span className="w-1 h-full bg-primary animate-bounce" style={{animationDelay: '0ms'}}/>
                        <span className="w-1 h-full bg-primary animate-bounce" style={{animationDelay: '150ms'}}/>
                        <span className="w-1 h-full bg-primary animate-bounce" style={{animationDelay: '300ms'}}/>
                      </span>
                      AI Speaking
                    </p>
                  )}
                </div>

                {isInterviewerEvaluation && transcript && status !== 'recording' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 w-full mb-6"
                  >
                    <p className="text-xs md:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                      Response:
                    </p>
                    <p className="text-base md:text-lg italic text-foreground/80">"{transcript}"</p>
                  </motion.div>
                )}

                <div className="flex flex-col items-center mb-8">
                  {isTextInputMode ? (
                    <div className="w-full max-w-2xl space-y-3">
                      <Textarea
                        value={typedInput}
                        onChange={(e) => handleTypedInputChange(e.target.value)}
                        placeholder={isInterviewerEvaluation ? "Type your interview question..." : "Type your response..."}
                        className="min-h-28 bg-background/50 border-white/10"
                        disabled={status !== 'waiting'}
                      />
                      <Button
                        onClick={handleSubmitTypedInput}
                        disabled={status !== 'waiting' || !typedInput.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                      >
                        Submit
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleToggleRecording}
                        disabled={status !== 'waiting' && status !== 'recording'}
                        className={`
                          relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300
                          ${status === 'recording' ? 'bg-red-500 text-white recording-pulse' :
                            status === 'waiting' ? 'bg-primary text-white hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]' :
                            'bg-white/5 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        {status === 'recording' ? (
                          <Square className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                        ) : (
                          <Mic className="w-10 h-10 md:w-12 md:h-12" />
                        )}
                      </button>
                      <p className={`mt-4 text-base md:text-lg font-medium transition-colors ${status === 'recording' ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {status === 'recording' ? 'Tap to stop' : status === 'waiting' ? (isInterviewerEvaluation ? 'Tap to ask your next question' : 'Tap to speak') : ''}
                      </p>
                    </>
                  )}
                </div>

                {transcript && status !== 'recording' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 w-full mt-4 md:mt-8"
                  >
                    {isInterviewerEvaluation ? (
                      <>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                          Transcription:
                        </p>
                        <p className="text-base md:text-lg italic text-foreground/80">"{interviewerTranscript || currentQuestion}"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                          Your response:
                        </p>
                        <p className="text-base md:text-lg italic text-foreground/80">"{transcript}"</p>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
