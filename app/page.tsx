"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./quiz.module.css";
import { QUESTIONS, type Question } from "./questions";

const QUIZ_SIZE = 10;
const QUESTION_TIME_SECONDS = 30;
const HINTS_PER_QUIZ = 3;
const THEME_STORAGE_KEY = "it-quiz-theme";

type Theme = "dark" | "light";
type AnswerRecord = { category: string; correct: boolean; timedOut?: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuiz(pool: Question[], n: number): Question[] {
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}

export default function QuizPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  // Initialize with a deterministic slice so SSR HTML matches the first
  // client render. The real shuffle happens in a useEffect on mount, before
  // the user can answer the first question.
  const [questions, setQuestions] = useState<Question[]>(() =>
    QUESTIONS.slice(0, Math.min(QUIZ_SIZE, QUESTIONS.length))
  );
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hiddenByHint, setHiddenByHint] = useState<Set<number>>(new Set());
  const [hintsLeft, setHintsLeft] = useState(HINTS_PER_QUIZ);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [finished, setFinished] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const tickRef = useRef<number | null>(null);

  const q = questions[idx];
  const total = questions.length;
  const answered = idx + (selected !== null ? 1 : 0);
  const progress = (answered / total) * 100;
  const locked = selected !== null;

  // Shuffle the quiz on mount. Done in an effect (not the useState
  // initializer) so server-rendered HTML doesn't disagree with the first
  // client render — Math.random() would produce different values.
  useEffect(() => {
    setQuestions(pickQuiz(QUESTIONS, QUIZ_SIZE));
  }, []);

  // --- Theme: hydrate on mount, persist on change ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    let initial: Theme = "dark";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        initial = "light";
      }
    } catch {
      // ignore — fall back to dark
    }
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  // --- Per-question countdown timer ---
  useEffect(() => {
    if (finished || locked) return;
    setTimeLeft(QUESTION_TIME_SECONDS);
    const start = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = QUESTION_TIME_SECONDS - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        handleTimeout();
        return;
      }
      setTimeLeft(remaining);
      tickRef.current = window.setTimeout(tick, 250);
    };
    tick();
    return () => {
      if (tickRef.current !== null) {
        window.clearTimeout(tickRef.current);
        tickRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, finished, locked]);

  function handleTimeout() {
    if (locked) return;
    setSelected(-1); // sentinel: no choice was made
    setAnswers((a) => [
      ...a,
      { category: q.category, correct: false, timedOut: true },
    ]);
    window.setTimeout(() => advance(), 1500);
  }

  function advance() {
    if (idx + 1 >= total) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setHiddenByHint(new Set());
  }

  function selectOption(i: number) {
    if (locked || hiddenByHint.has(i)) return;
    const correct = i === q.answer;
    setSelected(i);
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { category: q.category, correct }]);
  }

  function useHint() {
    if (hintsLeft <= 0 || locked || hiddenByHint.size > 0) return;
    const wrongIndices = q.options
      .map((_, i) => i)
      .filter((i) => i !== q.answer);
    const hidden = new Set(shuffle(wrongIndices).slice(0, 2));
    setHiddenByHint(hidden);
    setHintsLeft((h) => h - 1);
  }

  function restart() {
    if (tickRef.current !== null) {
      window.clearTimeout(tickRef.current);
      tickRef.current = null;
    }
    setQuestions(pickQuiz(QUESTIONS, QUIZ_SIZE));
    setIdx(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setHiddenByHint(new Set());
    setHintsLeft(HINTS_PER_QUIZ);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setFinished(false);
    setShareStatus("idle");
  }

  const breakdown = useMemo(() => {
    const byCat: Record<string, { correct: number; total: number }> = {};
    answers.forEach((a) => {
      if (!byCat[a.category]) byCat[a.category] = { correct: 0, total: 0 };
      byCat[a.category].total++;
      if (a.correct) byCat[a.category].correct++;
    });
    return byCat;
  }, [answers]);

  function buildShareText() {
    const pct = Math.round((score / total) * 100);
    const catLines = Object.entries(breakdown).map(
      ([cat, v]) =>
        `${v.correct === v.total ? "✓" : v.correct === 0 ? "✗" : "•"} ${cat}: ${v.correct}/${v.total}`
    );
    return [`IT Quiz — ${score}/${total} (${pct}%)`, "", ...catLines].join(
      "\n"
    );
  }

  async function shareScore() {
    const text = buildShareText();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Legacy fallback for non-HTTPS / older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("error");
      window.setTimeout(() => setShareStatus("idle"), 2500);
    }
  }

  function letter(i: number) {
    return String.fromCharCode(65 + i);
  }

  const timerWarning = !locked && timeLeft <= 5;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerTopRow}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
        </div>
        <h1 className={styles.title}>IT Quiz</h1>
        <div className={styles.subtitle}>
          Networking, Hardware, IP &amp; Subnetting
        </div>
      </header>

      <div className={styles.card}>
        {finished ? (
          <ResultsView
            score={score}
            total={total}
            breakdown={breakdown}
            onRestart={restart}
            onShare={shareScore}
            shareStatus={shareStatus}
          />
        ) : (
          <>
            <div className={styles.metaRow}>
              <span>
                Question {idx + 1} of {total}
              </span>
              <span className={styles.metaRight}>
                <span
                  className={`${styles.timer} ${timerWarning ? styles.timerWarn : ""}`}
                  aria-live="polite"
                >
                  ⏱ {timeLeft}s
                </span>
                <span>Score: {score}</span>
              </span>
            </div>
            <div
              className={styles.progress}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={styles.progressBar}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.questionHeader}>
              <span className={styles.categoryTag}>{q.category}</span>
              <button
                className={styles.hintBtn}
                onClick={useHint}
                disabled={hintsLeft <= 0 || locked || hiddenByHint.size > 0}
                title="Remove two wrong answers"
              >
                💡 Hint ({hintsLeft} left)
              </button>
            </div>
            <div className={styles.question}>{q.q}</div>
            <div className={styles.options}>
              {q.options.map((opt, i) => {
                const isCorrect = locked && i === q.answer;
                const isWrong =
                  locked && i === selected && i !== q.answer && selected !== -1;
                const isHidden = hiddenByHint.has(i);
                const cls = [
                  styles.option,
                  isCorrect ? styles.optionCorrect : "",
                  isWrong ? styles.optionWrong : "",
                  isHidden ? styles.optionHidden : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => selectOption(i)}
                    disabled={locked || isHidden}
                    aria-hidden={isHidden ? "true" : undefined}
                  >
                    <span className={styles.letter}>{letter(i)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {locked && (
              <div
                className={`${styles.feedback} ${
                  selected === q.answer
                    ? styles.feedbackCorrect
                    : styles.feedbackWrong
                }`}
              >
                <strong>
                  {selected === q.answer
                    ? "Correct!"
                    : selected === -1
                      ? "Time's up."
                      : "Incorrect."}
                </strong>{" "}
                {q.explain}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.btn}
                onClick={advance}
                disabled={!locked}
              >
                {idx === total - 1 ? "See Results" : "Next →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultsView({
  score,
  total,
  breakdown,
  onRestart,
  onShare,
  shareStatus,
}: {
  score: number;
  total: number;
  breakdown: Record<string, { correct: number; total: number }>;
  onRestart: () => void;
  onShare: () => void;
  shareStatus: "idle" | "copied" | "error";
}) {
  const pct = Math.round((score / total) * 100);
  let message = "Keep practicing!";
  if (pct === 100) message = "Perfect score!";
  else if (pct >= 80) message = "Great job!";
  else if (pct >= 60) message = "Not bad — room to grow.";

  return (
    <div className={styles.result}>
      <h2 className={styles.resultHeading}>{message}</h2>
      <div className={styles.score}>
        {score} / {total}
      </div>
      <div className={styles.scoreDetail}>{pct}% correct</div>
      <div className={styles.breakdown}>
        <h3 className={styles.breakdownHeading}>By Category</h3>
        {Object.entries(breakdown).map(([cat, v]) => (
          <div key={cat} className={styles.breakdownRow}>
            <span>{cat}</span>
            <span>
              {v.correct} / {v.total}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.resultActions}>
        <button
          className={styles.btnSecondary}
          onClick={onShare}
          disabled={shareStatus === "copied"}
        >
          {shareStatus === "copied"
            ? "Copied!"
            : shareStatus === "error"
              ? "Copy failed — try again"
              : "Share score"}
        </button>
        <button className={styles.btn} onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}
