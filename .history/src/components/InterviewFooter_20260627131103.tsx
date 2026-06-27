import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shuffle, ListOrdered } from "lucide-react";
import { categories, type FilterMode } from "@/data/questions";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";

function getMatchPercentage(original: string, user: string): number {
  if (!user.trim()) return 0;
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const keywords = normalize(original);
  if (keywords.length === 0) return 0;
  const userWords = new Set(normalize(user));
  const matched = keywords.filter((w) => userWords.has(w)).length;
  return Math.round((matched / keywords.length) * 100);
}

export interface UserAnswer {
  question: string;
  originalAnswer: string;
  userAnswer: string;
}

interface InterviewFooterProps {
  selectedLanguages: string[];
  onToggleLanguage: (id: string) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  userAnswers: UserAnswer[];
  isListening: boolean;
  voices: { name: string; label: string; lang: string }[];
  selectedVoice: string;
  onVoiceChange: (name: string) => void;
  disabled: boolean;
}

type ActiveTab = "categories" | "user";

export function InterviewFooter({
  selectedLanguages,
  onToggleLanguage,
  filterMode,
  onFilterModeChange,
  userAnswers,
  isListening,
  voices,
  selectedVoice,
  onVoiceChange,
  disabled,
}: InterviewFooterProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("categories");

  const speakSample = (voiceName: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello, I will be your interviewer today.");
    utterance.rate = 0.92;
    const voice = window.speechSynthesis.getVoices().find((v) => v.name === voiceName);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceChange = (name: string) => {
    onVoiceChange(name);
    speakSample(name);
  };

  const totalSelected = selectedLanguages.length;

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm relative z-50">
      {/* Tab bar with voice selector and filter */}
      <div className="flex items-center border-b border-border overflow-visible">
        {/* Voice selector */}
        {voices.length > 0 && (
          <div className="flex items-center px-3 border-r border-border">
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              disabled={disabled}
              className="bg-transparent border-none text-muted-foreground text-[10px] font-display py-2 pr-1 outline-none disabled:opacity-40 cursor-pointer"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name} className="bg-card text-foreground">
                  {v.name.split(" ").slice(0, 2).join(" ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter mode selector */}
        <div className="flex items-center px-2 border-r border-border">
          <button
            onClick={() => !disabled && onFilterModeChange("random")}
            disabled={disabled}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-l-md text-[10px] font-display font-semibold transition-all border ${
              filterMode === "random"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
            } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            title="Random order"
          >
            <Shuffle className="h-3 w-3" />
            Random
          </button>
          <button
            onClick={() => !disabled && onFilterModeChange("sequential")}
            disabled={disabled}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-r-md text-[10px] font-display font-semibold transition-all border-y border-r ${
              filterMode === "sequential"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
            } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            title="Sequential order"
          >
            <ListOrdered className="h-3 w-3" />
            Sequential
          </button>
        </div>

        {/* Category dropdowns */}
        <div
          className={`flex-1 flex items-center gap-1.5 py-2 overflow-x-auto overflow-y-visible scrollbar-hide px-2 ${
            activeTab === "categories" ? "border-b-2 border-primary" : ""
          }`}
          onClick={() => setActiveTab("categories")}
        >
          {categories.map((cat) => (
            <MultiSelectDropdown
              key={cat.id}
              category={cat}
              selected={selectedLanguages}
              onToggle={onToggleLanguage}
              disabled={disabled}
            />
          ))}
          {totalSelected > 0 && (
            <span className="shrink-0 text-[10px] text-primary font-display font-bold px-1">
              {totalSelected} selected
            </span>
          )}
        </div>

        {/* User tab */}
        <button
          onClick={() => setActiveTab("user")}
          className={`flex items-center justify-center gap-1 px-4 py-2 transition-colors relative ${
            activeTab === "user"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="relative">
            <User className="h-4 w-4" />
            {isListening && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
          {userAnswers.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">
              {userAnswers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="h-36 overflow-y-auto overflow-x-hidden p-3">
        <AnimatePresence mode="wait">
          {activeTab === "categories" ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {totalSelected === 0 ? (
                <p className="text-xs text-muted-foreground">Select topics from the dropdowns above to begin.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selectedItems = cat.items.filter((i) => selectedLanguages.includes(i.id));
                    if (selectedItems.length === 0) return null;
                    return selectedItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => !disabled && onToggleLanguage(item.id)}
                        disabled={disabled}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary font-display hover:bg-primary/20 transition-colors disabled:cursor-not-allowed"
                      >
                        <span className="text-[9px] text-muted-foreground uppercase">{cat.name.slice(0, 3)}</span>
                        {item.name}
                        <span className="text-primary/60 text-[10px]">×</span>
                      </button>
                    ));
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="user"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {userAnswers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No answers recorded yet...</p>
              ) : (
                userAnswers.map((ans, i) => (
                  <div key={i} className="rounded-lg border border-border bg-secondary/50 p-3 space-y-2">
                    <p className="text-xs font-display text-primary">{ans.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expected</p>
                        <p className="text-xs text-foreground/70 max-h-[80px] overflow-y-auto">{ans.originalAnswer}</p>
                      </div>
                      <div>
                        {(() => {
                          const pct = getMatchPercentage(ans.originalAnswer, ans.userAnswer);
                          const pass = pct >= 50;
                          return (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Your Answer</p>
                                <span className={`text-[10px] font-bold ${pass ? "text-green-400" : "text-red-400"}`}>
                                  {pct}% match
                                </span>
                              </div>
                              <p className={`text-xs p-2 rounded-md max-h-[80px] overflow-y-auto ${
                                pass
                                  ? "bg-green-500/15 border border-green-500/30 text-green-300"
                                  : "bg-red-500/15 border border-red-500/30 text-red-300"
                              }`}>
                                {ans.userAnswer || "No answer recorded"}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
