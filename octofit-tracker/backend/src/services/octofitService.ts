import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw badRequest('Activity details are required');
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const objectIdPattern = /^[0-9a-f]{24}$/i;
  if (typeof userId !== 'string' || !objectIdPattern.test(userId) ||
      typeof teamId !== 'string' || !objectIdPattern.test(teamId)) {
    throw badRequest('Valid userId and teamId are required');
  }
  if (typeof type !== 'string' || !type.trim() ||
      typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw badRequest('A type and positive minutes are required');
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('The specified user or team does not exist'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw badRequest('Team details are required');
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() ||
      typeof mascot !== 'string' || !mascot.trim()) {
    throw badRequest('A team name and mascot are required');
  }
  const objectIdPattern = /^[0-9a-f]{24}$/i;
  if (!Array.isArray(members) || !members.every(
    (member): member is string => typeof member === 'string' && objectIdPattern.test(member),
  )) {
    throw badRequest('Members must be valid user IDs');
  }
  if (members.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: members } });
    if (existingMembers !== new Set(members).size) {
      throw Object.assign(new Error('One or more team members do not exist'), { status: 404 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([
    Team.find().select('_id name').lean(),
    Activity.find().select('team points').lean(),
  ]);
  const pointsByTeam = new Map<string, number>();
  for (const activity of activities) {
    const teamId = activity.team.toString();
    pointsByTeam.set(teamId, (pointsByTeam.get(teamId) ?? 0) + activity.points);
  }

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [workouts, recentActivity] = await Promise.all([
    Workout.find().lean(),
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
  ]);
  const goalFocus = user.fitnessGoal.trim().toLowerCase();
  const activityType = recentActivity?.type.trim().toLowerCase();
  const activityFocus = activityType
    ? ({ run: 'endurance', cycle: 'endurance', walk: 'endurance' }[activityType] ?? activityType)
    : undefined;

  return workouts
    .map((workout) => {
      const focus = workout.focus.trim().toLowerCase();
      const matchesGoal = focus === goalFocus;
      const matchesActivity = activityFocus !== undefined && focus === activityFocus;
      return {
        workout,
        priority: matchesGoal ? 0 : matchesActivity ? 1 : 2,
        reason: matchesGoal
          ? `Matches your ${user.fitnessGoal} fitness goal`
          : matchesActivity
            ? `Builds on your recent ${recentActivity?.type} activity`
            : 'Recommended workout',
      };
    })
    .sort((left, right) => left.priority - right.priority || left.workout.title.localeCompare(right.workout.title))
    .map(({ workout, reason }) => ({ ...workout, reason }));
}

export { User };
