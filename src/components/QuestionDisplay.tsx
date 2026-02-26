import { motion } from "framer-motion";
import { TimerBar } from "./TimerBar";

interface QuestionDisplayProps {
  question: string;
  language: string;
  questionNumber: number;
  totalQuestions: number;
  elapsed: number;
  totalTime: number;
  minTime: number;
  transcript: string;
  isListening: boolean;
  isSpeaking: boolean;
}

export function QuestionDisplay({
  question,
  language,
  questionNumber,
  totalQuestions,
  elapsed,
  totalTime,
  minTime,
  transcript,
  isListening,
  isSpeaking,
}: QuestionDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto px-4"
    >
      {/* Question info */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-display">
        <span className="px-2 py-1 rounded bg-secondary border border-border uppercase">
          {language}
        </span>
        <span>
          Question {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-xl sm:text-2xl font-display text-center text-foreground leading-relaxed">
        {question}
      </h2>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 text-primary">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute h-3 w-3 rounded-full bg-primary opacity-75" />
            <span className="relative rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="text-xs font-display uppercase tracking-wider">Speaking question...</span>
        </div>
      )}

      {/* Timer */}
      <div className="w-full max-w-md">
        <TimerBar elapsed={elapsed} total={totalTime} minTime={minTime} />
      </div>

      {/* Live transcript */}
      <div className="w-full rounded-xl border border-border bg-secondary/30 p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          {isListening && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-destructive opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-destructive" />
            </span>
          )}
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">
            {isListening ? "Listening..." : "Microphone off"}
          </span>
        </div>
        <p className="text-sm text-foreground/80 font-body leading-relaxed">
          {transcript || "Start speaking to see your answer here..."}
        </p>
      </div>
    </motion.div>
  );
}
