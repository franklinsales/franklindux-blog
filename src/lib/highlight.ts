import { Marked } from "marked";
import markedKatex from "marked-katex-extension";
import { createHighlighter, type BundledLanguage } from "shiki";

type ShikiHighlighter = Awaited<ReturnType<typeof createHighlighter>>;

const SUPPORTED_LANGS: BundledLanguage[] = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "bash",
  "sh",
  "json",
  "css",
  "html",
  "markdown",
  "yaml",
];

const FALLBACK_LANG: BundledLanguage = "bash";

let highlighterPromise: Promise<ShikiHighlighter> | null = null;

function getHighlighter(): Promise<ShikiHighlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: SUPPORTED_LANGS,
    });
  }
  return highlighterPromise;
}

export async function renderMarkdown(content: string): Promise<string> {
  const hl = await getHighlighter();

  const instance = new Marked(
    markedKatex({ throwOnError: false }),
    {
      renderer: {
        code({ text, lang }: { text: string; lang?: string }): string {
          const rawLang = lang?.split(" ")[0];

          if (rawLang === "mermaid") {
            return `<div class="mermaid" data-source="${escapeHtml(text)}">${escapeHtml(text)}</div>`;
          }

          if (rawLang === "chartjs") {
            return `<div class="chartjs-container"><canvas class="chartjs" data-source="${escapeHtml(text)}"></canvas></div>`;
          }

          const language: BundledLanguage =
            rawLang && SUPPORTED_LANGS.includes(rawLang as BundledLanguage)
              ? (rawLang as BundledLanguage)
              : FALLBACK_LANG;
          try {
            return hl.codeToHtml(text, {
              lang: language,
              themes: { dark: "github-dark", light: "github-light" },
              defaultColor: "dark",
            });
          } catch {
            return `<pre class="shiki shiki-fallback"><code>${escapeHtml(text)}</code></pre>`;
          }
        },
      },
    }
  );

  return await instance.parse(content);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
