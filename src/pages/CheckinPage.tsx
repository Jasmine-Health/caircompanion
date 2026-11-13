import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui';
import { CheckinQuestionField } from '../components/checkin/CheckinQuestionField';
import { CheckinFollowupReply } from '../components/checkin/CheckinFollowupReply';
import { SafetyLine } from '../components/checkin/SafetyLine';
import { APIError } from '../config/api';
import { answerLabel, unansweredQuestions } from '../lib/checkin';
import {
  getCheckin,
  submitCheckinAnswers,
  type CheckinAnswer,
  type CheckinAnswerItem,
  type CheckinQuestion,
  type CheckinView,
  type SubmitCheckinResult,
} from '../services/checkinService';

type Unavailable = 'missing' | 'closed' | 'error';

type Phase =
  | { kind: 'loading' }
  | { kind: 'unavailable'; reason: Unavailable }
  | { kind: 'ready'; view: CheckinView; questions: CheckinQuestion[] };

const UNAVAILABLE: Record<Unavailable, { title: string; body: string }> = {
  missing: { title: 'This check-in is no longer open', body: 'Thank you for checking. There is nothing to answer here now.' },
  closed: { title: 'This check-in has closed', body: 'Thank you for checking. There is nothing to answer here now.' },
  error: { title: 'We could not load this check-in', body: 'Please check your connection and try again.' },
};

const doneLink =
  'flex items-center justify-center w-full min-h-12 rounded-xl bg-[#6F42C1] text-white font-medium hover:bg-[#5a32a3] focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:ring-offset-2';

function unavailableReason(error: unknown): Unavailable {
  if (error instanceof APIError && error.status === 404) return 'missing';
  if (error instanceof APIError && error.status === 409) return 'closed';
  return 'error';
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div>
      <p id="checkin-progress" className="text-sm font-medium text-gray-700">
        Question {current} of {total}
      </p>
      <div
        role="progressbar"
        aria-labelledby="checkin-progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        className="mt-1 h-2 rounded-full bg-gray-200"
      >
        <div className="h-2 rounded-full bg-[#6F42C1] transition-all" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}

function CheckinFlow({ checkinId }: { checkinId: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [step, setStep] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, CheckinAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitCheckinResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const fetchView = useCallback(
    () =>
      getCheckin(checkinId).then(
        (view) => setPhase({ kind: 'ready', view, questions: unansweredQuestions(view) }),
        (error: unknown) => setPhase({ kind: 'unavailable', reason: unavailableReason(error) })
      ),
    [checkinId]
  );

  useEffect(() => {
    fetchView();
  }, [fetchView]);

  // Move focus to the new heading on every screen change, so keyboard and
  // screen reader users start at the question.
  useEffect(() => {
    headingRef.current?.focus();
  }, [phase.kind, step, result]);

  if (phase.kind === 'loading') {
    return (
      <div role="status" className="h-full flex items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading check-in</span>
      </div>
    );
  }

  if (phase.kind === 'unavailable') {
    const text = UNAVAILABLE[phase.reason];
    return (
      <div className="min-h-full bg-gray-50 px-4 py-6 max-w-2xl mx-auto">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
          <h1 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-gray-900 focus:outline-none">
            {text.title}
          </h1>
          <p className="text-base text-gray-700">{text.body}</p>
          {phase.reason === 'error' ? (
            <Button
              size="lg"
              className="w-full min-h-12"
              onClick={() => {
                setPhase({ kind: 'loading' });
                fetchView();
              }}
            >
              Try again
            </Button>
          ) : (
            <Link to="/" className={doneLink}>
              Done
            </Link>
          )}
        </section>
      </div>
    );
  }

  const { view, questions } = phase;
  const total = questions.length;
  const question = questions[step];

  const setAnswer = (id: string, value: CheckinAnswer | undefined) =>
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined) delete next[id];
      else next[id] = value;
      return next;
    });

  const submit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const items: CheckinAnswerItem[] = questions.flatMap((q) => {
        const value = answers[q.id];
        return value === undefined ? [] : [{ question_id: q.id, value }];
      });
      const res = await submitCheckinAnswers(view.checkin_id, items);
      if (res.stored.length === 0) setSubmitError('We could not save your answers. Please try again.');
      else setResult(res);
    } catch (error) {
      const reason = unavailableReason(error);
      if (reason === 'error') setSubmitError('We could not send your answers. Please check your connection and try again.');
      else setPhase({ kind: 'unavailable', reason });
    } finally {
      setIsSubmitting(false);
    }
  };

  let body;
  if (result) {
    body = (
      <>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" aria-hidden="true" />
          <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-xl font-semibold text-gray-900 focus:outline-none">
            Answers sent
          </h2>
          {view.closing_line && <p className="mt-2 text-base text-gray-700">{view.closing_line}</p>}
        </section>
        {result.followup && <CheckinFollowupReply followup={result.followup} />}
        <Link to="/" className={doneLink}>
          Done
        </Link>
      </>
    );
  } else if (total === 0) {
    body = (
      <>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" aria-hidden="true" />
          <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-xl font-semibold text-gray-900 focus:outline-none">
            Already answered
          </h2>
          <p className="mt-2 text-base text-gray-700">All the questions in this check-in have been answered. Thank you.</p>
        </section>
        <Link to="/" className={doneLink}>
          Done
        </Link>
      </>
    );
  } else if (!question) {
    body = (
      <>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-gray-900 focus:outline-none">
            Check your answers
          </h2>
          <dl className="mt-2 divide-y divide-gray-100">
            {questions.map((q, index) => {
              const value = answers[q.id];
              return (
                <div key={q.id} className="py-3">
                  <dt className="text-sm text-gray-600">{q.text}</dt>
                  <dd className="mt-1 flex flex-wrap items-center justify-between gap-x-3">
                    <span className="text-base font-semibold text-gray-900">
                      {value === undefined ? 'Not answered' : answerLabel(q, value)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(index)}
                      aria-label={`Change answer: ${q.text}`}
                      className="min-h-12 px-3 rounded-xl text-[#6F42C1] font-medium hover:bg-[#6F42C1]/5 focus:outline-none focus:ring-2 focus:ring-[#6F42C1]"
                    >
                      Change
                    </button>
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
        {submitError && (
          <p role="alert" className="text-base text-red-700">
            {submitError}
          </p>
        )}
        <Button size="lg" className="w-full min-h-12" isLoading={isSubmitting} onClick={submit}>
          Send answers
        </Button>
      </>
    );
  } else {
    const isLast = step === total - 1;
    body = (
      <>
        {step === 0 && <p className="text-base text-gray-700">{view.intro}</p>}
        <Progress current={step + 1} total={total} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <CheckinQuestionField
            key={question.id}
            ref={headingRef}
            question={question}
            value={answers[question.id]}
            onChange={(value) => setAnswer(question.id, value)}
          />
        </div>
        <div className="flex gap-3">
          {step > 0 && !reviewed && (
            <Button variant="secondary" size="lg" className="flex-1 min-h-12" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button
            size="lg"
            className="flex-1 min-h-12"
            disabled={answers[question.id] === undefined}
            onClick={() => {
              if (isLast || reviewed) {
                setReviewed(true);
                setStep(total);
              } else {
                setStep(step + 1);
              }
            }}
          >
            {isLast || reviewed ? 'Review answers' : 'Next'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{view.title}</h1>
      <SafetyLine text={view.safety_line} />
      {body}
    </div>
  );
}

/** One check-in, one question per screen, then a review and send. */
export function CheckinPage() {
  const { checkinId = '' } = useParams();
  return <CheckinFlow key={checkinId} checkinId={checkinId} />;
}
