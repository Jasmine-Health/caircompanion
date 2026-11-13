import { useId, useState, type FormEvent } from 'react';
import { MessageSquareText } from 'lucide-react';
import { Button } from '../ui';
import { replyInConversation } from '../../services/healthDataService';
import type { CheckinFollowup } from '../../services/checkinService';

/**
 * The CairCompanion question Map sends after a risk answer, with a reply box.
 * The reply goes into the same CairCompanion conversation Map started, the
 * way an SMS reply would.
 */
export function CheckinFollowupReply({ followup }: { followup: CheckinFollowup }) {
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState<{ text: string; response: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  const headingId = useId();

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setIsSending(true);
    setError(null);
    try {
      const result = await replyInConversation(followup.conversation_id, text);
      setSent({ text, response: result?.response?.trim() || null });
    } catch {
      setError('We could not send your reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section aria-labelledby={headingId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 id={headingId} className="flex items-center gap-2 font-semibold text-gray-900">
        <MessageSquareText className="w-5 h-5 text-[#6F42C1]" aria-hidden="true" />
        CairCompanion
      </h3>
      <p className="mt-2 text-base text-gray-800">{followup.message}</p>

      {sent ? (
        <div aria-live="polite" className="mt-3 space-y-2">
          <p className="text-sm text-gray-600">You replied: {sent.text}</p>
          {sent.response && <p className="bg-[#6F42C1]/5 rounded-xl p-3 text-base text-gray-800">{sent.response}</p>}
        </div>
      ) : (
        <form onSubmit={send} className="mt-3">
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
            Your reply
          </label>
          <textarea
            id={fieldId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={2000}
            className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:border-[#6F42C1]"
          />
          {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
          <Button type="submit" size="lg" className="mt-2 w-full min-h-12" isLoading={isSending} disabled={!draft.trim()}>
            Send reply
          </Button>
        </form>
      )}
    </section>
  );
}
