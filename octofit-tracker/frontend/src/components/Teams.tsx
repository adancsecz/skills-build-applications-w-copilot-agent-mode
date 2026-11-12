import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamResponse = {
  teams: Array<{ _id?: string; name: string; mascot: string; members: string[] }>;
};

const loadTeams = () => getJson<TeamResponse>('/api/teams');

export default function Teams() {
  return (
    <CapabilityCard<TeamResponse>
      title="Teams"
      description="Manage teams and members."
      load={loadTeams}
      emptyMessage="No teams yet."
      isEmpty={(data) => data.teams.length === 0}
      render={({ teams }) => (
        <ul>
          {teams.map((team, index) => (
            <li key={team._id ?? `${team.name}-${index}`}>
              {team.name} ({team.mascot}) - {team.members.length} members
            </li>
          ))}
        </ul>
      )}
    />
  );
}
