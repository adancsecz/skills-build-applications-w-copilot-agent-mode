import { useMemo, useState, type FormEvent } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutResponse = {
  suggestions: Array<{ title: string; reason: string; focus?: string }>;
};

export default function Workouts() {
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState<{ email: string } | null>(null);
  const loadWorkouts = useMemo(
    () => request
      ? () => getJson<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(request.email)}`)
      : undefined,
    [request],
  );
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequest({ email: email.trim() });
  };

  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      load={loadWorkouts}
      idleMessage="Enter a user email to load workout suggestions."
      controls={
        <form className="mb-3" onSubmit={submit}>
          <label className="form-label" htmlFor="workout-user-email">User email</label>
          <input
            className="form-control mb-2"
            id="workout-user-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="btn btn-primary" type="submit">Get suggestions</button>
        </form>
      }
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
