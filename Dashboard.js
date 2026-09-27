function getDashboardData() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName('Users');

  if (!sheet) {
    throw new Error('Sheet "Users" not found');
  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length < 2) {
    return {
      users: [],
      groups: []
    };
  }

  const headers = values[0];

  const rows =
    values
      .slice(1)
      .map(row => {

        const user = {};

        headers.forEach(
          (header, index) => {
            user[header] =
              row[index];
          }
        );

        return user;

      });


  const users =
    rows
      .filter(row => row.UserId)
      .map(parseDashboardUser);


  const groups =
    [...new Set(
      users
        .map(user => user.group)
        .filter(Boolean)
    )].sort();


  return {
    users,
    groups
  };

}

function parseDashboardUser(row) {

Logger.log("row" + row.LevelResults +  "123");
  const levels = parseLevelResults2(
    row.LevelResults
  ) || [];
 Logger.log("123:" +  levels);
  if(levels == null)
  return;
  const completedLevels =
    levels.filter(
      level => level.completed
    ).length;

  const startedLevels =
    levels.filter(
      level => level.started
    ).length;

  const scores =
    levels
      .map(level => level.score)
      .filter(
        score => typeof score === 'number' && score !== null
      );

  const averageScore =
    scores.length > 0
      ? scores.reduce(
          (sum, score) => sum + score,
          0
        ) / scores.length
      : null;

  return {

    userId:
      String(row.UserId || ''),

    pilgrimNumber:
      String(row.PilgrimNumber || ''),

    fullName:
      String(row.FullName || 'Без имени'),

    group:
      String(row.GroupId || 'Без группы'),

    groupId:
      String(row.GroupId || ''),

    levels,

    startedLevels,

    completedLevels,

    progressPercent:
      (completedLevels / 7) * 100,

    averageScore

  };

}

function parseLevelResults2(levelResultsRaw) {

  const NOT_STARTED = (i) => ({
    level: i,
    status: 'NOT_STARTED',
    started: false,
    completed: false,
    score: null,
    completedAt: null
  });

  const emptyLevels = () => {
    const levels = [];
    for (let i = 0; i < 7; i++) levels.push(NOT_STARTED(i));
    return levels;
  };

  if (!levelResultsRaw || levelResultsRaw === '{}' || levelResultsRaw === '') {
    return emptyLevels();
  }

  const levelMap = {};

  if (typeof levelResultsRaw === 'string') {
    try {
      let cleaned = levelResultsRaw.trim();

      // Remove outer quotes if present
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
      }

      // Extract level entries like "level_0={...}"
      const levelMatches = cleaned.match(/level_\d+={[^}]+}/g) || [];

      levelMatches.forEach(match => {
        const levelIdEnd = match.indexOf('=');
        const levelId = match.substring(0, levelIdEnd).trim();
        const content = match.substring(levelIdEnd + 2, match.length - 1); // strip = and { }

        const params = {};

        // Parse key=value pairs inside the braces (split only on first '=')
        const paramMatches = content.match(/(\w+)=([^,}]+)/g) || [];
        paramMatches.forEach(param => {
          const eq = param.indexOf('=');
          const key = param.slice(0, eq).trim();
          const value = param.slice(eq + 1).trim();
          params[key] = value;
        });

        levelMap[levelId] = params;
      });
    } catch (e) {
      Logger.log('Error parsing level results: ' + e.message);
      return emptyLevels();
    }
  }

  // Build levels array with all 7 levels
  const levels = [];
  for (let i = 0; i < 7; i++) {
    const levelId = 'level_' + i;
    const raw = levelMap[levelId];

    if (!raw) {
      levels.push(NOT_STARTED(i));
      continue;
    }

    const hasScore = raw.ScorePercent !== undefined && raw.ScorePercent !== '';
    const scorePercent = hasScore ? parseFloat(raw.ScorePercent) : null;
    const hasCompletedAt = !!raw.CompletedAt;

    // Completed if there is a CompletedAt timestamp OR a positive score
    const isCompleted = hasCompletedAt || (scorePercent !== null && scorePercent > 0);

    // Started if there is any meaningful data beyond just LevelId
    const isStarted = isCompleted || hasScore;

    levels.push({
      level: i,
      status: isCompleted ? 'COMPLETED' : (isStarted ? 'STARTED' : 'NOT_STARTED'),
      started: isStarted,
      completed: isCompleted,
      score: scorePercent,
      completedAt: raw.CompletedAt || null
    });
  }

  return levels;
}