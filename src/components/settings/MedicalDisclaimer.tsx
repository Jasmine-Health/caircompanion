import { Card, CardContent } from '../ui';

function DisclaimerBlock({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <ul className="mt-1 space-y-1">
        {bullets.map((bullet) => (
          <li key={bullet} className="text-sm text-gray-600 flex gap-2">
            <span className="text-gray-400">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MedicalDisclaimer() {
  return (
    <div>
      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
        Medical disclaimer
      </h2>
      <Card className="bg-gray-100/80 border-gray-200">
        <CardContent className="space-y-4 text-sm">
          <DisclaimerBlock
            title="Where Your Information Comes From"
            bullets={[
              'All medical details shown here come only from your EHR and care plan.',
              'We do not use data from outside medical sources.',
            ]}
          />
          <DisclaimerBlock
            title="How to Use This App"
            bullets={[
              'CairCompanion is meant to help you understand and follow your care plan.',
              'It does not diagnose, treat, or replace clinical judgment.',
            ]}
          />
          <DisclaimerBlock
            title="Important Reminder"
            bullets={[
              'Always consult your doctor or a qualified clinician for medical questions or decisions.',
            ]}
          />
          <p className="text-xs text-gray-500 italic leading-relaxed">
            Disclaimer: This app does not provide medical advice and is not a substitute for
            professional medical diagnosis or treatment. Always seek the advice of a qualified
            healthcare provider before making medical decisions or acting on information provided
            by this app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
