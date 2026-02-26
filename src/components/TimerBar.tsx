import { motion } from "framer-motion";

interface TimerBarProps {
  elapsed: number;
  total: number;
  minTime: number;
}

export function TimerBar({ elapsed, total, minTime }: TimerBarProps) {
  const progress = Math.min((elapsed / total) * 100, 100);
  const minProgress = (minTime / total) * 100;
  const minutes = Math.floor((total - elapsed) / 60);
  const seconds = Math.floor((total - elapsed) % 60);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-display text-muted-foreground">
        <span>Time remaining</span>
        <span className={elapsed >= total - 10 ? "text-destructive" : ""}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
        {/* Min time marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-muted-foreground/40 z-10"
          style={{ left: `${minProgress}%` }}
        />
        <motion.div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
