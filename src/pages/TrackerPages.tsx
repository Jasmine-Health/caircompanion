import { Pill, Dumbbell, Smile, Apple } from 'lucide-react';
import { TrackerObservationsPage } from '../components/TrackerObservationsPage';
import { getMedications, getExercise, getMood, getDiet } from '../services/healthDataService';

export function MedicationsPage() {
  return (
    <TrackerObservationsPage
      title="Medications"
      subtitle="View your medication records"
      icon={Pill}
      iconColor="text-purple-600"
      bgColor="bg-purple-100"
      fetchData={getMedications}
    />
  );
}

export function ExercisePage() {
  return (
    <TrackerObservationsPage
      title="Exercise"
      subtitle="View your exercise and activity records"
      icon={Dumbbell}
      iconColor="text-green-600"
      bgColor="bg-green-100"
      fetchData={getExercise}
    />
  );
}

export function MoodPage() {
  return (
    <TrackerObservationsPage
      title="Mood"
      subtitle="View your mood tracking records"
      icon={Smile}
      iconColor="text-yellow-600"
      bgColor="bg-yellow-100"
      fetchData={getMood}
    />
  );
}

export function DietPage() {
  return (
    <TrackerObservationsPage
      title="Diet"
      subtitle="View your diet and nutrition records"
      icon={Apple}
      iconColor="text-orange-600"
      bgColor="bg-orange-100"
      fetchData={getDiet}
    />
  );
}
