"use client";

import { useCallback, useSyncExternalStore } from "react";
import styles from "./PostContent.module.css";

interface PostContentProps {
  contentHtml: string;
  contentClassName: string;
}

const STEP = 0.1;
const MIN_STEP = -3;
const MAX_STEP = 5;
const STORAGE_KEY = "post-font-step";

const BASE_P = 1.4;
const BASE_LI = 1.2;

// ── Tiny external store ──────────────────────────────────────────
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return 0;
  const n = parseInt(raw, 10);
  return !isNaN(n) && n >= MIN_STEP && n <= MAX_STEP ? n : 0;
}

function getServerSnapshot(): number {
  return 0;
}
// ────────────────────────────────────────────────────────────────

export default function PostContent({
  contentHtml,
  contentClassName,
}: PostContentProps) {
  const step = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const decrease = useCallback(() => {
    const next = Math.max(step - 1, MIN_STEP);
    localStorage.setItem(STORAGE_KEY, String(next));
    notify();
  }, [step]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  }, []);

  const increase = useCallback(() => {
    const next = Math.min(step + 1, MAX_STEP);
    localStorage.setItem(STORAGE_KEY, String(next));
    notify();
  }, [step]);

  const pSize = (BASE_P + step * STEP).toFixed(2);
  const liSize = (BASE_LI + step * STEP).toFixed(2);

  return (
    <>
      <div className={styles.controls} role="group" aria-label="Tamanho da fonte">
        <span className={styles.label}>Fonte</span>
        <button
          className={styles.btn}
          onClick={decrease}
          disabled={step <= MIN_STEP}
          aria-label="Diminuir tamanho da fonte"
          title="Diminuir fonte"
        >
          A-
        </button>
        <button
          className={styles.btn}
          onClick={reset}
          disabled={step === 0}
          aria-label="Restaurar tamanho padrão da fonte"
          title="Restaurar padrão"
        >
          A
        </button>
        <button
          className={styles.btn}
          onClick={increase}
          disabled={step >= MAX_STEP}
          aria-label="Aumentar tamanho da fonte"
          title="Aumentar fonte"
        >
          A+
        </button>
      </div>

      <article
        className={contentClassName}
        style={
          step !== 0
            ? ({
                "--post-p-size": `${pSize}rem`,
                "--post-li-size": `${liSize}rem`,
              } as React.CSSProperties)
            : undefined
        }
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </>
  );
}
