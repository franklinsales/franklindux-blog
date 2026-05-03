"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import styles from "./PostContent.module.css";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

interface PostContentProps {
  contentHtml: string;
  contentClassName: string;
}

const STEP = 0.1;
const MIN_STEP = -3;
const MAX_STEP = 5;
const STORAGE_KEY = "post-font-step";

const BASE_P = 1.22;
const BASE_LI = 1.22;

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

  useEffect(() => {
    import("mermaid").then((mod) => {
      const mermaid = mod.default;
      // Restore original source on already-rendered diagrams so mermaid can re-render them
      document.querySelectorAll<HTMLElement>(".mermaid[data-processed]").forEach((el) => {
        const source = el.getAttribute("data-source");
        if (source) {
          el.removeAttribute("data-processed");
          el.innerHTML = source;
        }
      });
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        flowchart: { useMaxWidth: true },
        themeVariables: {
          fontSize: "28px",
        },
      });
      mermaid.run({ querySelector: ".mermaid" });
    });
  }, [contentHtml, step]);

  useEffect(() => {
    import("chart.js/auto").then((mod) => {
      const { Chart } = mod;
      document.querySelectorAll<HTMLCanvasElement>("canvas.chartjs").forEach((canvas) => {
        // Destroy existing instance if re-rendering
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();

        const source = canvas.getAttribute("data-source");
        if (!source) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const config = JSON.parse(source) as any;
          new Chart(canvas, config);
        } catch (e) {
          console.error("chartjs: failed to parse config", e);
        }
      });
    });
  }, [contentHtml]);

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
        <span className={styles.separator} aria-hidden="true" />
        <ThemeToggle />
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
