"use client";

import { useMemo, useState } from "react";
import styles from "./quiz.module.css";
import { QUESTIONS } from "./questions";

type AnswerRecord = { category: string; correct: boolean };

export default function QuizPage() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const progress = (idx / total) * 100;
  const locked = selected !== null;

  function letter(i: number) {
    return String.fromCharCode(65 + i);
  }

  function selectOption(i: number) {
    if (locked) return;
    const correct = i === q.answer;
    setSelected(i);
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { category: q.category, correct }]);
  }

  function next() {
    if (idx + 1 >= total) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setIdx(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setFinished(false);
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
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
          />
        ) : (
          <>
            <div className={styles.metaRow}>
              <span>
                Question {idx + 1} of {total}
              </span>
              <span>Score: {score}</span>
            </div>
            <div className={styles.progress}>
              <div
                className={styles.progressBar}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.categoryTag}>{q.category}</span>
            <div className={styles.question}>{q.q}</div>
            <div className={styles.options}>
              {q.options.map((opt, i) => {
                const isCorrect = locked && i === q.answer;
                const isWrong = locked && i === selected && i !== q.answer;
                const cls = [
                  styles.option,
                  isCorrect ? styles.optionCorrect : "",
                  isWrong ? styles.optionWrong : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => selectOption(i)}
                    disabled={locked}
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
                  {selected === q.answer ? "Correct!" : "Incorrect."}
                </strong>{" "}
                {q.explain}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.btn}
                onClick={next}
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
}: {
  score: number;
  total: number;
  breakdown: Record<string, { correct: number; total: number }>;
  onRestart: () => void;
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
      <button className={styles.btn} onClick={onRestart}>
        Try Again
      </button>
    </div>
  );
}
