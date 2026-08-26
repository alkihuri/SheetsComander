const UsersRepository = {

  SHEET_NAME: 'Users',

  HEADERS: [
    'UserId',
    'PilgrimNumber',
    'FullName',
    'GroupId',
    'CreatedAt',
    'UpdatedAt',
    'Status'
  ],


  getSheet: function() {

    let sheet;

    try {

      sheet =
        SheetsRepository.getSheet(
          this.SHEET_NAME
        );

    } catch (error) {

      if (error.code !== 'SHEET_NOT_FOUND') {
        throw error;
      }

      const spreadsheet =
        SheetsRepository.getSpreadsheet();

      sheet =
        spreadsheet.insertSheet(
          this.SHEET_NAME
        );
    }

    this.ensureHeaders(sheet);

    return sheet;
  },


  ensureHeaders: function(sheet) {

    const range =
      sheet.getRange(
        1,
        1,
        1,
        this.HEADERS.length
      );

    const current =
      range.getValues()[0];


    let needsUpdate = false;


    for (
      let i = 0;
      i < this.HEADERS.length;
      i++
    ) {

      if (
        current[i] !==
        this.HEADERS[i]
      ) {

        needsUpdate = true;
        break;
      }
    }


    if (needsUpdate) {

      range.setValues([
        this.HEADERS
      ]);
    }
  },


  getHeaderMap: function(sheet) {

    const headers =
      sheet
        .getRange(
          1,
          1,
          1,
          this.HEADERS.length
        )
        .getValues()[0];


    const map = {};


    headers.forEach(function(header, index) {

      if (header) {

        map[header] =
          index + 1;
      }

    });


    return map;
  },


  rowToUser: function(row) {

    return {
      UserId: row[0],
      PilgrimNumber: row[1],
      FullName: row[2],
      GroupId: row[3],
      CreatedAt: Utils.normalizeValue(row[4]),
      UpdatedAt: Utils.normalizeValue(row[5]),
      Status: row[6]
    };
  },


  userToRow: function(user) {

    return [
      user.UserId || '',
      user.PilgrimNumber || '',
      user.FullName || '',
      user.GroupId || '',
      user.CreatedAt || '',
      user.UpdatedAt || '',
      user.Status || 'active'
    ];
  },


  findByUserId: function(userId) {

    const sheet =
      this.getSheet();


    const lastRow =
      sheet.getLastRow();


    if (lastRow < 2) {
      return null;
    }


    const values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          this.HEADERS.length
        )
        .getValues();


    for (
      let i = 0;
      i < values.length;
      i++
    ) {

      if (
        String(values[i][0]) ===
        String(userId)
      ) {

        return {
          row: i + 2,
          user:
            this.rowToUser(values[i])
        };
      }
    }


    return null;
  },


  findByPilgrimNumber: function(
    pilgrimNumber
  ) {

    const sheet =
      this.getSheet();


    const lastRow =
      sheet.getLastRow();


    if (lastRow < 2) {
      return null;
    }


    const values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          this.HEADERS.length
        )
        .getValues();


    for (
      let i = 0;
      i < values.length;
      i++
    ) {

      if (
        String(values[i][1]) ===
        String(pilgrimNumber)
      ) {

        return {
          row: i + 2,
          user:
            this.rowToUser(values[i])
        };
      }
    }


    return null;
  },


  create: function(user) {

    const sheet =
      this.getSheet();


    const row =
      this.userToRow(user);


    sheet.appendRow(row);


    return {
      row: sheet.getLastRow(),
      user: user
    };
  },


  update: function(rowNumber, user) {

    const sheet =
      this.getSheet();


    sheet
      .getRange(
        rowNumber,
        1,
        1,
        this.HEADERS.length
      )
      .setValues([
        this.userToRow(user)
      ]);


    return {
      row: rowNumber,
      user: user
    };
  },


  delete: function(rowNumber) {

    const sheet =
      this.getSheet();


    sheet.deleteRow(
      rowNumber
    );


    return {
      deleted: true,
      row: rowNumber
    };
  }
};