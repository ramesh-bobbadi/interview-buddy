import { Volume2 } from "lucide-react";
import type { VoiceOption } from "@/hooks/useSpeechSynthesis";

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selected: string;
  onChange: (name: string) => void;
  disabled?: boolean;
}

export function VoiceSelector({ voices, selected, onChange, disabled }: VoiceSelectorProps) {
  if (voices.length === 0) return null;

  const speakSample = (voiceName: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello, I will be your interviewer today.");
    utterance.rate = 0.92;
    const voice = window.speechSynthesis.getVoices().find((v) => v.name === voiceName);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const handleChange = (name: string) => {
    onChange(name);
    speakSample(name);
  };

  return (
    <div className="flex items-center gap-2">
      <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="bg-secondary border border-border text-foreground text-xs rounded-lg px-3 py-2 font-display focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-40 cursor-pointer"
      >
        {voices.map((v) => (
          <option key={v.name} value={v.name} className="bg-secondary text-foreground">
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}
