import { useEffect, useState } from 'react';
import { User, Stethoscope, FlaskConical } from 'lucide-react';
import {
  getPatientData,
  getEncounters,
  getDiagnosticReports,
  type PatientRecord,
  type EncounterRecord,
  type DiagnosticReportRecord,
} from '../services/healthDataService';
import { formatDate } from '../lib/utils';

const tabs = [
  { id: 'summary', label: 'Summary', icon: User },
  { id: 'history', label: 'Medical History', icon: Stethoscope },
  { id: 'labs', label: 'Labs & Tests', icon: FlaskConical },
] as const;

type TabId = (typeof tabs)[number]['id'];

function getPatientName(patient: PatientRecord): string {
  const given = patient.name?.[0]?.given?.join(' ') || '';
  const family = patient.name?.[0]?.family || '';
  return `${given} ${family}`.trim() || 'Patient';
}

export function HealthDataPage() {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [reports, setReports] = useState<DiagnosticReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatientData(), getEncounters(), getDiagnosticReports()])
      .then(([p, e, r]) => {
        setPatients(Array.isArray(p) ? p : []);
        setEncounters(Array.isArray(e) ? e : []);
        setReports(Array.isArray(r) ? r : []);
      })
      .catch((err) => console.error('Failed to load health data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const patient = patients[0];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6F42C1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 py-4 md:px-6 md:py-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Health Data</h1>
          <p className="text-sm text-gray-500 mt-1">View your comprehensive health information</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#6F42C1] text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 pb-8">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {!patient ? (
                <p className="text-gray-500 text-center py-8">No patient data available</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">{getPatientName(patient)}</p>
                  </div>
                  {patient.birthDate && (
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium text-gray-900">{formatDate(new Date(patient.birthDate))}</p>
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">{patient.gender}</p>
                    </div>
                  )}
                  {patient.telecom?.map((t, i) =>
                    t.value ? (
                      <div key={i}>
                        <p className="text-sm text-gray-500 capitalize">{t.system || 'Contact'}</p>
                        <p className="font-medium text-gray-900">{t.value}</p>
                      </div>
                    ) : null
                  )}
                  {patient.address?.[0] && (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">
                        {[...(patient.address[0].line || []), patient.address[0].city, patient.address[0].state]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {encounters.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medical history records</p>
              ) : (
                encounters.map((enc) => (
                  <div key={enc.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {enc.type?.[0]?.coding?.[0]?.display || 'Encounter'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: {enc.status}
                      {enc.period?.start && ` • ${formatDate(new Date(enc.period.start))}`}
                    </p>
                    {enc.serviceProvider?.display && (
                      <p className="text-sm text-gray-600 mt-1">{enc.serviceProvider.display}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No lab results available</p>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {report.code?.coding?.[0]?.display || 'Lab Report'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: {report.status}
                      {report.effectiveDateTime &&
                        ` • ${formatDate(new Date(report.effectiveDateTime))}`}
                    </p>
                    {report.conclusion && (
                      <p className="text-sm text-gray-700 mt-2">{report.conclusion}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
