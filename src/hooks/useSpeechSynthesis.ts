import { useCallback, useRef, useState, useEffect } from "react";

export interface VoiceOption {
  name: string;
  label: string;
  lang: string;
}

// Preferred voices ranked by quality
const PREFERRED_KEYWORDS = [
  "Google UK English Male",
  "Google UK English Female",
  "Google US English",
  "Microsoft Mark",
  "Microsoft Zira",
  "Microsoft David",
  "Samantha",
  "Daniel",
  "Karen",
  "Moira",
  "Alex",
  "Fiona",
  "Tessa",
];

function pickBestVoices(voices: SpeechSynthesisVoice[]): VoiceOption[] {
  const english = voices.filter((v) => v.lang.startsWith("en"));
  const picked: VoiceOption[] = [];
  const seen = new Set<string>();

  // First pass: preferred voices
  for (const keyword of PREFERRED_KEYWORDS) {
    const match = english.find(
      (v) => v.name.includes(keyword) && !seen.has(v.name)
    );
    if (match) {
      seen.add(match.name);
      picked.push({ name: match.name, label: match.name.replace(/\(.*\)/, "").trim(), lang: match.lang });
    }
    if (picked.length >= 5) break;
  }

  // Fill up to 5 with any remaining English voices
  if (picked.length < 5) {
    for (const v of english) {
      if (!seen.has(v.name)) {
        seen.add(v.name);
        picked.push({ name: v.name, label: v.name.replace(/\(.*\)/, "").trim(), lang: v.lang });
      }
      if (picked.length >= 5) break;
    }
  }

  return picked;
}

export function useSpeechSynthesis() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const best = pickBestVoices(voices);
        setAvailableVoices(best);
        if (best.length > 0 && !selectedVoice) {
          setSelectedVoice(best[0].name);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const chosen = voices.find((v) => v.name === selectedVoice);
    if (chosen) utterance.voice = chosen;

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, []);

  return { speak, cancel, availableVoices, selectedVoice, setSelectedVoice };
}
