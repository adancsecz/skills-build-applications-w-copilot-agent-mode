import { CapabilityCard } from './CapabilityCard.js';

type WorkoutResponse = {
  suggestions: Array<{ title: string; reason: string; focus?: string }>;
};

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
      emptyMessage="No workout suggestions yet."
      isEmpty={(data) => data.suggestions.length === 0}
      render={({ suggestions }) => (
        <ul>
          {suggestions.map((suggestion) => (
            <li key={suggestion.title}>
              <strong>{suggestion.title}</strong>
              {suggestion.focus && ` (${suggestion.focus})`} - {suggestion.reason}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
