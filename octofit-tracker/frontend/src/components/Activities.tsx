import { CapabilityCard } from './CapabilityCard.js';

type ActivityResponse = {
  activities: Array<{ _id?: string; type: string; minutes: number; points: number }>;
};

export default function Activities() {
  return (
    <CapabilityCard<ActivityResponse>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyMessage="No activities yet."
      isEmpty={(data) => data.activities.length === 0}
      render={({ activities }) => (
        <ul>
          {activities.map((activity, index) => (
            <li key={activity._id ?? `${activity.type}-${index}`}>
              {activity.type} - {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    />
  );
}
