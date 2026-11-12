import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardResponse = {
  leaderboard: Array<{ teamName: string; totalPoints: number; rank: number }>;
};

const loadLeaderboard = () => getJson<LeaderboardResponse>('/api/leaderboard');

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      load={loadLeaderboard}
      emptyMessage="No leaderboard scores yet."
      isEmpty={(data) => data.leaderboard.length === 0}
      render={({ leaderboard }) => (
        <ol>
          {leaderboard.map((entry) => (
            <li key={entry.teamName}>
              Rank {entry.rank}: {entry.teamName} - {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    />
  );
}
