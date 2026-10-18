import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Stethoscope, MessageSquareText, Send, Check } from 'lucide-react';
import {
  getCareTeamNotes,
  replyToNurseQuestion,
  type CareTeamNotes,
  type NurseQuestion,
} from '../services/healthDataService';

function formatNoteDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CareNotesPage() {
  const [notes, setNotes] = useState<CareTeamNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Per-question reply input + in-flight state, keyed by alert id.
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    getCareTeamNotes()
      .then((data) => {
        setNotes(data);
        setError(null);
      })
      .catch(() => {
        setNotes(null);
        setError('Could not load care team notes.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!snackbar) return;
    const timer = setTimeout(() => setSnackbar(null), 3000);
    return () => clearTimeout(timer);
  }, [snackbar]);

  const submitReply = async (question: NurseQuestion) => {
    const text = (replyDrafts[question.id] || '').trim();
    if (!text) return;
    setReplying(question.id);
    try {
      await replyToNurseQuestion(question.conversation_id, text);
      setNotes((prev) =>
        prev
          ? {
              ...prev,
              nurse_questions: prev.nurse_questions.map((q) =>
                q.id === question.id
                  ? { ...q, replied: true, reply_text: text, reply_date: new Date().toISOString() }
                  : q
              ),
            }
          : prev
      );
      setReplyDrafts((prev) => {
        const next = { ...prev };
        delete next[question.id];
        return next;
      });
      setSnackbar('Reply sent to your care team');
    } catch {
      setSnackbar('Could not send your reply. Please try again.');
    } finally {
      setReplying(null);
    }
  };

  const physicianInstructions = notes?.physician_instructions ?? [];
  const nurseQuestions = notes?.nurse_questions ?? [];
  const isEmpty = physicianInstructions.length === 0 && nurseQuestions.length === 0;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Care notes</h1>
          <p className="text-sm text-gray-500 mt-1">Messages and instructions from your care team</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error && !notes ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-16 px-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No care notes yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              When your care team shares instructions or asks you something, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-8">
            {/* Nurse questions first: they may need a reply. */}
            {nurseQuestions.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Questions for you
                </h2>
                {nurseQuestions.map((q) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#6F42C1]/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquareText className="w-5 h-5 text-[#6F42C1]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 leading-snug">{q.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatNoteDate(q.date)}</p>
                        </div>
                      </div>

                      {q.replied ? (
                        <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 mb-1">
                            <Check className="w-3.5 h-3.5" />
                            You replied
                          </div>
                          {q.reply_text && <p className="text-sm text-gray-600">{q.reply_text}</p>}
                        </div>
                      ) : (
                        <div className="mt-3 flex items-end gap-2">
                          <textarea
                            value={replyDrafts[q.id] || ''}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            rows={2}
                            placeholder="Type your reply..."
                            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6F42C1]/40"
                          />
                          <button
                            type="button"
                            disabled={replying === q.id || !(replyDrafts[q.id] || '').trim()}
                            onClick={() => submitReply(q)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6F42C1] px-3 py-2 text-sm font-medium text-white hover:bg-[#5c35a4] disabled:opacity-50"
                          >
                            {replying === q.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </section>
            )}

            {/* Physician instructions: read-only. */}
            {physicianInstructions.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  From your care team
                </h2>
                {physicianInstructions.map((instr) => {
                  const urgent = (instr.priority || '').toLowerCase() === 'urgent';
                  const completed = (instr.status || '').toLowerCase() === 'completed';
                  return (
                    <motion.div
                      key={instr.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className={`p-4 ${completed ? 'opacity-70' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-900 leading-snug">{instr.message}</p>
                              {urgent && (
                                <span className="flex-shrink-0 text-[11px] font-medium px-2 py-1 rounded-md bg-red-50 text-red-600">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                {instr.from || 'Your Care Team'}
                              </span>
                              {completed && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">
                                  <Check className="w-3 h-3" />
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">{formatNoteDate(instr.date)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </section>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-auto bg-gray-900 text-white px-4 py-3 rounded-xl text-sm z-50"
          >
            {snackbar}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
