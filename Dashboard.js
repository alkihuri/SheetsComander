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
    rows.map(
      parseDashboardUser
    );


  const groups =
    [...new Set(
      users
        .map(user => user.group)
        .filter(Boolean)
    )];


  return {
    users,
    groups
  };

}

function parseDashboardUser(row) {

  // UserId
  // PilgrimNumber
  // FullName
  // GroupId
  // LevelResults
  //
  // здесь разбираем LevelResults
  // и превращаем его в нормальный объект
}