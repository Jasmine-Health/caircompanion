import { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { numberButtons, numberRangeText, parseNumberAnswer } from '../../lib/checkin';
import type { CheckinAnswer, CheckinQuestion, NumberQuestion } from '../../services/checkinService';

interface CheckinQuestionFieldProps {
  question: CheckinQuestion;
  value: CheckinAnswer | undefined;
  onChange: (value: CheckinAnswer | undefined) => void;
}

const tile =
  'flex items-center rounded-xl border-2 bg-white text-lg text-gray-900 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#6F42C1] focus-within:ring-offset-2';

function tileState(selected: boolean) {
  return selected ? 'border-[#6F42C1] bg-[#6F42C1]/5 font-semibold' : 'border-gray-200 hover:border-[#6F42C1]/50';
}

function NumberField({ question, value, onChange }: { question: NumberQuestion; value: CheckinAnswer | undefined; onChange: (value: CheckinAnswer | undefined) => void }) {
  const [draft, setDraft] = useState(value === undefined ? '' : String(value));
  const invalid = draft.trim() !== '' && parseNumberAnswer(question, draft) === null;
  const hintId = `${question.id}-hint`;
  return (
    <div className="mt-4">
      <label htmlFor={`${question.id}-number`} className="block text-base text-gray-700">
        Your answer
      </label>
      <input
        id={`${question.id}-number`}
        type="number"
        inputMode="decimal"
        step="any"
        min={question.min}
        max={question.max}
        value={draft}
        aria-describedby={hintId}
        aria-invalid={invalid}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(parseNumberAnswer(question, e.target.value) ?? undefined);
        }}
        className="mt-1 w-full min-h-14 px-4 rounded-xl border-2 border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:border-[#6F42C1]"
      />
      <p id={hintId} className={cn('mt-1 text-sm', invalid ? 'text-red-700' : 'text-gray-600')}>
        {numberRangeText(question)}
      </p>
    </div>
  );
}

/** One check-in question as a group of large radio buttons (or a number field for a wide range). */
export const CheckinQuestionField = forwardRef<HTMLHeadingElement, CheckinQuestionFieldProps>(
  ({ question, value, onChange }, headingRef) => {
    const buttons = question.type === 'number' ? numberButtons(question) : null;
    return (
      <fieldset>
        <legend className="w-full">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-gray-900 focus:outline-none">
            {question.text}
          </h2>
        </legend>

        {question.type !== 'number' ? (
          <div className="mt-4 space-y-3">
            {question.options.map((option) => (
              <label key={option.value} className={cn(tile, 'gap-3 min-h-14 px-4 py-3', tileState(value === option.value))}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="w-5 h-5 flex-shrink-0 accent-[#6F42C1]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        ) : buttons ? (
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
            {buttons.map((n) => (
              <label key={n} className={cn(tile, 'justify-center min-h-14', tileState(value === n))}>
                <input
                  type="radio"
                  name={question.id}
                  value={n}
                  checked={value === n}
                  onChange={() => onChange(n)}
                  className="sr-only"
                />
                <span>{n}</span>
              </label>
            ))}
          </div>
        ) : (
          <NumberField key={question.id} question={question} value={value} onChange={onChange} />
        )}
      </fieldset>
    );
  }
);

CheckinQuestionField.displayName = 'CheckinQuestionField';
