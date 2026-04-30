"use client";

import { useState, useEffect } from "react";
import styles from "./PostContent.module.css";

interface PostContentProps {
  contentHtml: string;
  contentClassName: string;
}

const STEP = 0.1;
const MIN_STEP = -3;
const MAX_STEP = 5;
const STORAGE_KEY = "post-font-step";

const BASE_P = 1.3;
const BASE_LI = 1.2;

export default function PostContent({
  contentHtml,
  contentClassName,
}: PostContentProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_STEP && parsed <= MAX_STEP) {
        setStep(parsed);
      }
    }
  }, []);

  const changeStep = (newStep: number) => {
    setStep(newStep);
    localStorage.setItem(STORAGE_KEY, String(newStep));
  };

  const pSize = (BASE_P + step * STEP).toFixed(2);
  const liSize = (BASE_LI + step * STEP).toFixed(2);

  return (
    <>
      <div className={styles.controls} role="group" aria-label="Tamanho da fonte">
        <span className={styles.label}>Fonte</span>
        <button
          className={styles.btn}
          onClick={() => changeStep(Math.max(step - 1, MIN_STEP))}
          disabled={step <= MIN_STEP}
          aria-label="Diminuir tamanho da fonte"
          title="Diminuir fonte"
        >
          A-
        </button>
        <button
          className={styles.btn}
          onClick={() => changeStep(0)}
          disabled={step === 0}
          aria-label="Restaurar tamanho padrão da fonte"
          title="Restaurar padrão"
        >
          A
        </button>
        <button
          className={styles.btn}
          onClick={() => changeStep(Math.min(step + 1, MAX_STEP))}
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
          {
            "--post-p-size": `${pSize}rem`,
            "--post-li-size": `${liSize}rem`,
          } as React.CSSProperties
        }
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </>
  );
}
