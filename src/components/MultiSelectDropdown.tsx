import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import type { Category } from "@/data/questions";

interface MultiSelectDropdownProps {
  category: Category;
  selected: string[];
  onToggle: (id: string) => void;
  disabled: boolean;
}

export function MultiSelectDropdown({ category, selected, onToggle, disabled }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedInCategory = category.items.filter((i) => selected.includes(i.id));
  const count = selectedInCategory.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="">
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold
          transition-all border
          ${count > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {category.name}
        {count > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
            {count}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-1 left-0 z-[200] min-w-[160px] max-h-[200px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg shadow-black/30"
          >
            {category.items.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-xs font-body text-left transition-colors
                    ${isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-secondary"
                    }
                  `}
                >
                  <span className={`
                    flex items-center justify-center w-4 h-4 rounded border transition-all
                    ${isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40"
                    }
                  `}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  {item.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
