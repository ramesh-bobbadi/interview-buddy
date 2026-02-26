import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InterviewerAvatar } from "@/components/InterviewerAvatar";
import { InterviewFooter, type UserAnswer } from "@/components/InterviewFooter";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { questionBank, type Question, type FilterMode } from "@/data/questions";

const MIN_TIME = 90;
const MAX_TIME = 300;
const WORDS_PER_SECOND = 2.5;

function calculateTime(answer: string): number {
  const wordCount = answer.split(/\s+/).length;
  const estimatedSeconds = wordCount / WORDS_PER_SECOND;
  return Math.max(MIN_TIME, Math.min(Math.ceil(estimatedSeconds * 1.5), MAX_TIME));
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Index() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("random");
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { transcript, isListening, startListening, stopListening, resetTranscript, isSupported } =
    useSpeechRecognition();
  const { speak, cancel: cancelSpeech, availableVoices, selectedVoice, setSelectedVoice } = useSpeechSynthesis();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalTime = currentQuestion ? calculateTime(currentQuestion.answer) : MIN_TIME;

  const toggleLanguage = useCallback((id: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }, []);

  const saveCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => {
      const existing = prev.findIndex((a) => a.question === currentQuestion.question);
      const entry = {
        question: currentQuestion.question,
        originalAnswer: currentQuestion.answer,
        userAnswer: transcript,
      };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [...prev, entry];
    });
  }, [currentQuestion, transcript]);

  const stopTimerAndListening = useCallback(() => {
    stopListening();
    cancelSpeech();
    setIsSpeaking(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [stopListening, cancelSpeech]);

  const advanceQuestion = useCallback(() => {
    if (!currentQuestion) return;
    saveCurrentAnswer();
    stopTimerAndListening();
    resetTranscript();
    setElapsed(0);

    if (currentIndex + 1 >= questions.length) {
      setIsInterviewing(false);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentQuestion, saveCurrentAnswer, stopTimerAndListening, resetTranscript, currentIndex, questions.length]);

  const goNext = useCallback(() => {
    if (!currentQuestion || currentIndex + 1 >= questions.length) return;
    saveCurrentAnswer();
    stopTimerAndListening();
    resetTranscript();
    setElapsed(0);
    setCurrentIndex((i) => i + 1);
  }, [currentQuestion, currentIndex, questions.length, saveCurrentAnswer, stopTimerAndListening, resetTranscript]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    saveCurrentAnswer();
    stopTimerAndListening();
    resetTranscript();
    setElapsed(0);
    setCurrentIndex((i) => i - 1);
  }, [currentIndex, saveCurrentAnswer, stopTimerAndListening, resetTranscript]);

  useEffect(() => {
    if (isInterviewing && currentQuestion) {
      setIsSpeaking(true);
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);

      speak(currentQuestion.question, () => {
        setIsSpeaking(false);
        resetTranscript();
        setElapsed(0);
        startListening();

        timerRef.current = setInterval(() => {
          setElapsed((prev) => {
            if (prev + 1 >= totalTime) {
              advanceQuestion();
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
      });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewing, currentIndex]);

  const handleStart = useCallback(() => {
    if (selectedLanguages.length === 0) return;

    const allQuestions = selectedLanguages.flatMap(
      (lang) => questionBank[lang] ?? []
    );

    const ordered = filterMode === "random" ? shuffleArray(allQuestions) : allQuestions;

    setQuestions(ordered);
    setCurrentIndex(0);
    setElapsed(0);
    setUserAnswers([]);
    setIsInterviewing(true);
    resetTranscript();
  }, [selectedLanguages, filterMode, resetTranscript]);

  const handleEnd = useCallback(() => {
    cancelSpeech();
    if (currentQuestion) {
      setUserAnswers((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          originalAnswer: currentQuestion.answer,
          userAnswer: transcript,
        },
      ]);
    }
    stopListening();
    resetTranscript();
    setIsInterviewing(false);
    setIsSpeaking(false);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentQuestion, transcript, stopListening, resetTranscript, cancelSpeech]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-visible">
      {/* Main body */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative p-4">
        <AnimatePresence mode="wait">
          {isInterviewing && currentQuestion ? (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 w-full max-w-2xl"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-display">
                <span className="px-2 py-1 rounded bg-secondary border border-border uppercase">
                  {currentQuestion.language}
                </span>
                <span>
                  {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-[10px] tabular-nums">
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / {Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, "0")}
                </span>
              </div>

              <InterviewerAvatar isSpeaking={isSpeaking} isListening={isListening} />

              <motion.p
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm sm:text-base text-center text-foreground/80 font-body leading-relaxed max-w-lg"
              >
                {currentQuestion.question}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <InterviewerAvatar isSpeaking={false} isListening={false} />
              {!isSupported && (
                <p className="text-xs text-destructive mt-2">
                  ⚠ Speech recognition not supported. Try Chrome.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pb-2">
        {isInterviewing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goPrev}
            disabled={currentIndex <= 0}
            className="px-5 py-3 rounded-xl font-display text-xs font-semibold tracking-wider uppercase transition-all duration-300 border-2 border-border text-muted-foreground bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isInterviewing ? handleEnd : handleStart}
          disabled={!isInterviewing && selectedLanguages.length === 0}
          className={`
            px-10 py-3 rounded-xl font-display text-sm font-semibold tracking-wider uppercase
            transition-all duration-300 border-2 backdrop-blur-sm
            ${
              isInterviewing
                ? "border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20"
                : selectedLanguages.length === 0
                ? "border-border text-muted-foreground bg-transparent cursor-not-allowed opacity-40"
                : "border-accent text-accent-foreground bg-accent/90 hover:bg-accent glow"
            }
          `}
        >
          {isInterviewing ? "End" : "Start Interview"}
        </motion.button>

        {isInterviewing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
            disabled={currentIndex + 1 >= questions.length}
            className="px-5 py-3 rounded-xl font-display text-xs font-semibold tracking-wider uppercase transition-all duration-300 border-2 border-border text-muted-foreground bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </motion.button>
        )}
      </div>

      {/* Footer */}
      <InterviewFooter
        selectedLanguages={selectedLanguages}
        onToggleLanguage={toggleLanguage}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        userAnswers={userAnswers}
        isListening={isListening}
        voices={availableVoices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        disabled={isInterviewing}
      />
    </div>
  );
}
