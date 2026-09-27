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

  const levels = parseLevelResults(
    row.LevelResults
  );

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

function parseLevelResults(levelResultsRaw) {

  const levels = [];

  if (!levelResultsRaw) {
    for (let i = 0; i < 7; i++) {
      levels.push({
        level: i,
        status: 'NOT_STARTED',
        started: false,
        completed: false,
        score: null,
        completedAt: null
      });
    }
    return levels;
  }

  let parsed = [];

  if (typeof levelResultsRaw === 'string') {
    try {
      parsed = JSON.parse(levelResultsRaw);
    } catch (e) {
      parsed = [];
    }
  } else if (Array.isArray(levelResultsRaw)) {
    parsed = levelResultsRaw;
  }

  for (let i = 0; i < 7; i++) {

    const raw = parsed[i];

    if (!raw) {
      levels.push({
        level: i,
        status: 'NOT_STARTED',
        started: false,
        completed: false,
        score: null,
        completedAt: null
      });
      continue;
    }

    const score =
      typeof raw.score === 'number'
        ? raw.score
        : raw.score !== null && raw.score !== undefined
          ? Number(raw.score)
          : null;

    levels.push({
      level: i,
      status:
        raw.status ||
        (
          raw.completed
            ? 'COMPLETED'
            : raw.started
              ? 'IN_PROGRESS'
              : 'NOT_STARTED'
        ),
      started: Boolean(raw.started),
      completed: Boolean(raw.completed),
      score: isFinite(score) ? score : null,
      completedAt: raw.completedAt || null
    });

  }

  return levels;

}