"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, ShieldCheck } from "lucide-react";

const PIN_LENGTH = 6;

export default function LoginPage() {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const submitPin = useCallback(
    async (pinValue: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/verify-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinValue }),
        });

        if (res.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError("Incorrect PIN");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setDigits(Array(PIN_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (digits.every((d) => d !== "")) {
      submitPin(digits.join(""));
    }
  }, [digits, submitPin]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    setError("");

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, PIN_LENGTH);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);

    if (next.every((d) => d !== "")) return; // useEffect will auto-submit
    inputRefs.current[pasted.length]?.focus();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Learn</h1>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Enter your 6-digit PIN
          </p>
        </div>

        <div
          className={`flex justify-center gap-3 ${shake ? "animate-shake" : ""}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              autoFocus={i === 0}
              className="h-14 w-12 rounded-lg border-2 bg-background text-center text-xl font-mono transition-colors focus:border-primary focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        <div className="mt-6 text-center text-sm">
          {loading && (
            <p className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </p>
          )}
          {error && <p className="text-destructive">{error}</p>}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground/60">
          Session expires after 1 hour
        </p>
      </div>
    </div>
  );
}
