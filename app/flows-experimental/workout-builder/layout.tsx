import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Builder - FitForge',
  description: 'Create custom workouts with drag-and-drop exercise builder',
};

export default function WorkoutBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}