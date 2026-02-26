import { motion } from "framer-motion";
import interviewerPhoto from "@/assets/interviewer-photo.png";

interface InterviewerAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export function InterviewerAvatar({ isSpeaking, isListening }: InterviewerAvatarProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Glow ring when active */}
      {(isSpeaking || isListening) && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            background: isSpeaking
              ? "radial-gradient(circle, hsl(174 72% 50% / 0.15), transparent 70%)"
              : "radial-gradient(circle, hsl(0 72% 55% / 0.1), transparent 70%)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Photo container */}
      <motion.div
        className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-border bg-card"
        animate={
          isSpeaking
            ? { scale: [1, 1.02, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={interviewerPhoto}
          alt="Interviewer"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className="mt-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isSpeaking && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-primary opacity-75" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-display text-primary uppercase tracking-wider">
              Speaking...
            </span>
          </>
        )}
        {isListening && !isSpeaking && (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-destructive opacity-75" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-destructive" />
            </span>
            <span className="text-xs font-display text-destructive uppercase tracking-wider">
              Listening...
            </span>
          </>
        )}
        {!isSpeaking && !isListening && (
          <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
            Ready
          </span>
        )}
      </motion.div>
    </div>
  );
}
