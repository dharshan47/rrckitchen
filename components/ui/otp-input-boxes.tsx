"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputBoxesProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const OTP_LENGTH = 6;

export function OtpInputBoxes({ value, onChange, disabled, className }: OtpInputBoxesProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));
  const digits = value.split("").concat(Array(Math.max(0, OTP_LENGTH - value.length)).fill(""));

  const focusIndex = useCallback((index: number) => {
    const next = inputRefs.current[index];
    if (next) next.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (disabled) return;
      if (!/^\d$/.test(char) && char !== "") return;
      const newDigits = [...digits];
      newDigits[index] = char;
      const newValue = newDigits.join("").slice(0, OTP_LENGTH);
      onChange(newValue);
      if (char && index < OTP_LENGTH - 1) {
        focusIndex(index + 1);
      }
    },
    [digits, disabled, onChange, focusIndex]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join("").slice(0, OTP_LENGTH));
        focusIndex(index - 1);
      }
    },
    [digits, disabled, onChange, focusIndex]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (!pasted) return;
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      focusIndex(nextIndex);
    },
    [disabled, onChange, focusIndex]
  );

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digits[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border-2 border-border bg-background text-center text-lg font-bold text-foreground shadow-sm outline-none transition-all",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "data-[filled=true]:border-primary/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            digits[index] && "border-primary/60"
          )}
          data-filled={!!digits[index]}
        />
      ))}
    </div>
  );
}
