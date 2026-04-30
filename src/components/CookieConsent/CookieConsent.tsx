"use client";

import { useState, useEffect, startTransition } from "react";
import styles from "./CookieConsent.module.css";

declare function gtag(...args: unknown[]): void;

type Consent = "all" | "essential";

const STORAGE_KEY = "cookie-consent";

function CookieIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const resolved = saved === "all" ? "all" : saved === "essential" ? "essential" : null;
    // Restore consent on hydration if the user already accepted previously
    if (resolved === "all") {
      gtag("consent", "update", { analytics_storage: "granted" });
    }
    startTransition(() => {
      setConsent(resolved);
    });
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(STORAGE_KEY, "all");
    gtag("consent", "update", { analytics_storage: "granted" });
    setConsent("all");
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(STORAGE_KEY, "essential");
    setConsent("essential");
  };

  // Not hydrated yet — render nothing to avoid mismatch
  if (consent === undefined) return null;

  return (
    <>
      {consent === null && (
        <div
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
        >
          <div className={styles.modal}>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <CookieIcon />
              </div>
              <h2 className={styles.title} id="cookie-title">
                Este site usa cookies
              </h2>
            </div>

            <p className={styles.description} id="cookie-desc">
              Utilizamos cookies para garantir o funcionamento do site e, com seu
              consentimento, para entender melhor nosso público e aprimorar o
              conteúdo.
            </p>

            <div className={styles.cookieList}>
              <div className={styles.cookieItem}>
                <div
                  className={`${styles.cookieItemIcon} ${styles.cookieItemIconEssential}`}
                >
                  <LockIcon />
                </div>
                <div className={styles.cookieItemContent}>
                  <div className={styles.cookieItemHeader}>
                    <span className={styles.cookieItemTitle}>Essenciais</span>
                    <span
                      className={`${styles.badge} ${styles.badgeRequired}`}
                    >
                      Sempre ativos
                    </span>
                  </div>
                  <p className={styles.cookieItemDescription}>
                    Necessários para o funcionamento básico do site — incluindo o
                    armazenamento da preferência de tema (dark/light).
                  </p>
                </div>
              </div>

              <div className={styles.cookieItem}>
                <div
                  className={`${styles.cookieItemIcon} ${styles.cookieItemIconMarketing}`}
                >
                  <ChartIcon />
                </div>
                <div className={styles.cookieItemContent}>
                  <div className={styles.cookieItemHeader}>
                    <span className={styles.cookieItemTitle}>
                      Marketing &amp; Analytics
                    </span>
                    <span
                      className={`${styles.badge} ${styles.badgeOptional}`}
                    >
                      Opcional
                    </span>
                  </div>
                  <p className={styles.cookieItemDescription}>
                    Usamos o Google Analytics para entender como os visitantes
                    interagem com o site e melhorar continuamente o conteúdo e a
                    experiência.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btnSecondary}
                onClick={handleEssentialOnly}
                type="button"
              >
                Somente Essenciais
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleAcceptAll}
                type="button"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
