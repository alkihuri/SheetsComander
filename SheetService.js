const SheetService = {

  health: function() {

    const spreadsheet = SheetsRepository.getSpreadsheet();

    return {
      status: 'ok',
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      timestamp: Utils.now()
    };
  },


  listSheets: function() {
    return SheetsRepository.listSheets();
  },


  getSheet: function(payload) {

    Validation.requireSheetName(payload);

    const sheet = SheetsRepository.getSheet(
      payload.sheet
    );

    return {
      id: sheet.getSheetId(),
      name: sheet.getName(),
      index: sheet.getIndex(),
      maxRows: sheet.getMaxRows(),
      maxColumns: sheet.getMaxColumns(),
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    };
  },


  getRange: function(payload) {

    Validation.requireSheetName(payload);
    Validation.requireRange(payload);

    return SheetsRepository.getRange(
      payload.sheet,
      payload.range
    );
  },


  getCell: function(payload) {

    Validation.requireSheetName(payload);

    Validation.require(
      payload.cell,
      'INVALID_CELL',
      'Cell is required'
    );

    return SheetsRepository.getCell(
      payload.sheet,
      payload.cell
    );
  },


  setCell: function(payload) {

    Validation.requireSheetName(payload);

    Validation.require(
      payload.cell,
      'INVALID_CELL',
      'Cell is required'
    );

    return SheetsRepository.setCell(
      payload.sheet,
      payload.cell,
      payload.value
    );
  },


  setRange: function(payload) {

    Validation.requireSheetName(payload);
    Validation.requireRange(payload);

    return SheetsRepository.setRange(
      payload.sheet,
      payload.range,
      payload.values
    );
  },


  appendRow: function(payload) {

    Validation.requireSheetName(payload);

    Validation.require(
      Array.isArray(payload.values),
      'INVALID_PAYLOAD',
      'Values must be an array'
    );

    return SheetsRepository.appendRow(
      payload.sheet,
      payload.values
    );
  },


  updateRow: function(payload) {

    Validation.requireSheetName(payload);

    Validation.require(
      payload.row,
      'INVALID_ROW',
      'Row is required'
    );

    return SheetsRepository.updateRow(
      payload.sheet,
      payload.row,
      payload.values
    );
  },


  createSheet: function(payload) {

    return SheetsRepository.createSheet(
      payload.name
    );
  },


  renameSheet: function(payload) {

    Validation.requireSheetName(payload);

    return SheetsRepository.renameSheet(
      payload.sheet,
      payload.newName
    );
  },


  deleteSheet: function(payload) {

    Validation.requireSheetName(payload);

    return SheetsRepository.deleteSheet(
      payload.sheet
    );
  }
};