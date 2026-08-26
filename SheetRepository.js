const SheetsRepository = {

  getSpreadsheet: function() {

    const config = getConfig();

    if (!config.spreadsheetId) {
      throw Utils.error(
        'CONFIGURATION_ERROR',
        'SPREADSHEET_ID is not configured'
      );
    }

    return SpreadsheetApp.openById(config.spreadsheetId);
  },


  getSheet: function(sheetName) {

    Validation.require(
      sheetName,
      'SHEET_NOT_FOUND',
      'Sheet name is required'
    );

    const spreadsheet = this.getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      throw Utils.error(
        'SHEET_NOT_FOUND',
        'Sheet "' + sheetName + '" was not found'
      );
    }

    return sheet;
  },


  listSheets: function() {

    const spreadsheet = this.getSpreadsheet();

    return spreadsheet
      .getSheets()
      .map(function(sheet) {

        return {
          id: sheet.getSheetId(),
          name: sheet.getName(),
          index: sheet.getIndex(),
          maxRows: sheet.getMaxRows(),
          maxColumns: sheet.getMaxColumns()
        };
      });
  },


  getRange: function(sheetName, rangeA1) {

    const sheet = this.getSheet(sheetName);
    const range = sheet.getRange(rangeA1);

    return {
      sheet: sheetName,
      range: rangeA1,
      values: Utils.normalizeMatrix(
        range.getValues()
      )
    };
  },


  getCell: function(sheetName, cell) {

    const sheet = this.getSheet(sheetName);
    const range = sheet.getRange(cell);

    return {
      sheet: sheetName,
      cell: cell,
      value: Utils.normalizeValue(
        range.getValue()
      )
    };
  },


  setCell: function(sheetName, cell, value) {

    const sheet = this.getSheet(sheetName);

    sheet
      .getRange(cell)
      .setValue(value);

    return {
      sheet: sheetName,
      cell: cell,
      value: Utils.normalizeValue(value)
    };
  },


  setRange: function(sheetName, rangeA1, values) {

    const sheet = this.getSheet(sheetName);
    const range = sheet.getRange(rangeA1);

    if (!Array.isArray(values)) {
      throw Utils.error(
        'INVALID_PAYLOAD',
        'Values must be an array'
      );
    }

    range.setValues(values);

    return {
      sheet: sheetName,
      range: rangeA1,
      values: Utils.normalizeMatrix(values)
    };
  },


  appendRow: function(sheetName, values) {

    const sheet = this.getSheet(sheetName);

    if (!Array.isArray(values)) {
      throw Utils.error(
        'INVALID_PAYLOAD',
        'Values must be an array'
      );
    }

    sheet.appendRow(values);

    return {
      sheet: sheetName,
      row: sheet.getLastRow(),
      values: values
    };
  },


  updateRow: function(sheetName, row, values) {

    const sheet = this.getSheet(sheetName);

    if (!Number.isInteger(row) || row < 1) {
      throw Utils.error(
        'INVALID_ROW',
        'Row must be a positive integer'
      );
    }

    if (!Array.isArray(values) || values.length === 0) {
      throw Utils.error(
        'INVALID_PAYLOAD',
        'Values must be a non-empty array'
      );
    }

    sheet
      .getRange(row, 1, 1, values.length)
      .setValues([values]);

    return {
      sheet: sheetName,
      row: row,
      values: values
    };
  },


  createSheet: function(name) {

    Validation.require(
      name,
      'INVALID_PAYLOAD',
      'Sheet name is required'
    );

    const spreadsheet = this.getSpreadsheet();

    if (spreadsheet.getSheetByName(name)) {
      throw Utils.error(
        'SHEET_ALREADY_EXISTS',
        'Sheet "' + name + '" already exists'
      );
    }

    const sheet = spreadsheet.insertSheet(name);

    return {
      id: sheet.getSheetId(),
      name: sheet.getName(),
      index: sheet.getIndex()
    };
  },


  renameSheet: function(sheetName, newName) {

    Validation.require(
      newName,
      'INVALID_PAYLOAD',
      'New sheet name is required'
    );

    const sheet = this.getSheet(sheetName);

    const spreadsheet = this.getSpreadsheet();

    if (
      spreadsheet.getSheetByName(newName) &&
      newName !== sheetName
    ) {
      throw Utils.error(
        'SHEET_ALREADY_EXISTS',
        'Sheet "' + newName + '" already exists'
      );
    }

    sheet.setName(newName);

    return {
      oldName: sheetName,
      newName: newName
    };
  },


  deleteSheet: function(sheetName) {

    const spreadsheet = this.getSpreadsheet();
    const sheet = this.getSheet(sheetName);

    if (spreadsheet.getSheets().length <= 1) {
      throw Utils.error(
        'CANNOT_DELETE_LAST_SHEET',
        'Cannot delete the last sheet'
      );
    }

    spreadsheet.deleteSheet(sheet);

    return {
      deleted: true,
      name: sheetName
    };
  }
};