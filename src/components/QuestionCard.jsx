import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle, XCircle, PartyPopper } from "lucide-react";

export default function QuestionCard({
  question,
  timeLimit,
  questionIndex,
  total,
  onAnswer,
  answerResult,
}) {
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [prevQuestionId, setPrevQuestionId] = useState(question?.id);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  if (question?.id !== prevQuestionId) {
    setSelected(null);
    setTimeLeft(timeLimit);
    setPrevQuestionId(question?.id);
  }

  useEffect(() => {
    startRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [question?.id, timeLimit]);

  function handleSelect(optId) {
    if (selected !== null || answerResult) return;
    setSelected(optId);
    clearInterval(timerRef.current);
    onAnswer(optId);
  }

  if (!question) return null;

  const progress = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 5;

  function getOptionClass(optId) {
    if (!answerResult) {
      return selected === optId
        ? "border-border bg-primary"
        : "border-border bg-surface hover:bg-surface-hover shadow-neubrutal-sm";
    }
    if (optId === answerResult.correct_option_id) {
      return "border-border bg-success/35 font-bold shadow-neubrutal-sm";
    }
    if (selected === optId && !answerResult.correct) {
      return "border-border bg-error/35 font-bold shadow-neubrutal-sm";
    }
    return "border-border bg-surface opacity-45 shadow-none";
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between text-sm font-bold text-text-secondary">
        <span>
          Question {questionIndex} of {total}
        </span>
        <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 border-2 border-border rounded-lg">
          <Clock
            className={`h-4 w-4 text-text ${isUrgent ? "animate-pulse text-error" : ""}`}
          />
          <span
            className={`font-mono font-bold ${isUrgent ? "text-error" : "text-text"}`}
          >
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>

      <div className="mb-2 h-4 overflow-hidden rounded-full border-2 border-border bg-surface">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isUrgent ? "bg-error" : "bg-primary"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-8 rounded-2xl border-2 border-border bg-surface p-6 shadow-neubrutal">
        <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
          {question.difficulty} DIFFICULTY
        </p>
        <p className="text-text font-bold text-md leading-relaxed">
          {question.definition}
        </p>
        {question.usage_example && (
          <p className="mt-3 italic text-text-secondary border-l-4 border-border pl-3">
            &ldquo;{question.usage_example}&rdquo;
          </p>
        )}
      </div>

      <div className="space-y-4">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            disabled={selected !== null || !!answerResult}
            className={`w-full rounded-xl border-2 p-4 text-left text-sm font-bold transition-all enabled:active:translate-x-0 enabled:active:translate-y-0 enabled:active:shadow-none enabled:hover:-translate-x-0.5 enabled:hover:-translate-y-0.5 enabled:hover:shadow-neubrutal disabled:cursor-default ${getOptionClass(
              opt.id,
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-text">{opt.text}</span>
              {answerResult && opt.id === answerResult.correct_option_id && (
                <CheckCircle className="h-5 w-5 text-success shrink-0 stroke-[2.5]" />
              )}
              {selected === opt.id && answerResult && !answerResult.correct && (
                <XCircle className="h-5 w-5 text-error shrink-0 stroke-[2.5]" />
              )}
            </div>
          </button>
        ))}
      </div>

      {answerResult && (
        <div
          className={`mt-6 rounded-xl border-2 border-border p-4 flex items-center justify-center gap-2 text-sm font-bold shadow-neubrutal ${
            answerResult.correct
              ? "bg-success/20 text-text"
              : "bg-error/20 text-text"
          }`}
        >
          {answerResult.correct ? (
            <>
              <PartyPopper className="h-5 w-5 text-success shrink-0 stroke-[2.5]" />
              <span>Correct! +10 points</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-error shrink-0 stroke-[2.5]" />
              <span>Wrong answer</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
