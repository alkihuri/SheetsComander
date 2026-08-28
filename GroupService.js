const GroupService = {

  GROUPS_SHEET_NAME: 'Groups',

  HEADERS: [
    'GroupId',
    'Name',
    'CreatedAt',
    'UpdatedAt',
    'Status'
  ],


  createGroup: function(payload) {

    const name = this.validateName(payload && payload.name);
    const lock = LockService.getScriptLock();

    lock.waitLock(30000);

    try {
      return this.createGroupWithoutLock(name);

    } finally {
      lock.releaseLock();
    }
  },


  ensureGroup: function(payload) {

    const name = this.validateName(payload && payload.name);
    const lock = LockService.getScriptLock();

    lock.waitLock(30000);

    try {
      const existing = this.findByName(name);

      if (existing) {
        return {
          group: existing.group
        };
      }

      return this.createGroupWithoutLock(name);

    } finally {
      lock.releaseLock();
    }
  },


  findGroup: function(payload) {

    const name = this.validateName(payload && payload.name);
    const result = this.findByName(name);

    return {
      found: !!result,
      group: result ? result.group : null
    };
  },


  getGroup: function(payload) {

    const groupId = this.validateGroupId(payload && payload.groupId);
    const result = this.findByGroupId(groupId);

    if (!result) {
      throw Utils.error(
        'GROUP_NOT_FOUND',
        'Group was not found'
      );
    }

    const sheetName = this.getGroupSheetName(result.group.GroupId);
    const sheet = SheetsRepository
      .getSpreadsheet()
      .getSheetByName(sheetName);

    return {
      group: result.group,
      sheet: {
        name: sheetName,
        exists: !!sheet
      }
    };
  },


  listGroups: function() {

    return {
      groups: this.getAllGroups()
    };
  },


  updateGroup: function(payload) {

    const groupId = this.validateGroupId(payload && payload.groupId);
    const result = this.findByGroupId(groupId);

    if (!result) {
      throw Utils.error(
        'GROUP_NOT_FOUND',
        'Group was not found'
      );
    }

    const group = result.group;

    if (payload.name !== undefined) {
      const name = this.validateName(payload.name);
      const sameName = this.findByName(name);

      if (sameName && sameName.group.GroupId !== group.GroupId) {
        throw Utils.error(
          'GROUP_ALREADY_EXISTS',
          'Group with this name already exists'
        );
      }

      group.Name = name;
    }

    if (payload.status !== undefined) {
      group.Status = String(payload.status);
    }

    group.UpdatedAt = Utils.now();
    this.updateGroupRow(result.row, group);

    return {
      group: group
    };
  },


  deleteGroup: function(payload) {

    const groupId = this.validateGroupId(payload && payload.groupId);
    const result = this.findByGroupId(groupId);

    if (!result) {
      throw Utils.error(
        'GROUP_NOT_FOUND',
        'Group was not found'
      );
    }

    const group = result.group;
    group.Status = 'inactive';
    group.UpdatedAt = Utils.now();
    this.updateGroupRow(result.row, group);

    return {
      group: group
    };
  },


  initializeGroupSheet: function(sheet) {

    const headers = ['UserId', 'FullName'];

    for (let level = 0; level < GROUP_CONFIG.LEVEL_COUNT; level++) {
      headers.push('Level ' + level);
    }

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  },


  createGroupWithoutLock: function(name) {

    if (this.findByName(name)) {
      throw Utils.error(
        'GROUP_ALREADY_EXISTS',
        'Group with this name already exists'
      );
    }

    const now = Utils.now();
    const group = {
      GroupId: Utils.generateId(),
      Name: name,
      CreatedAt: now,
      UpdatedAt: now,
      Status: 'active'
    };
    const sheetName = this.getGroupSheetName(group.GroupId);
    const spreadsheet = SheetsRepository.getSpreadsheet();

    if (spreadsheet.getSheetByName(sheetName)) {
      throw Utils.error(
        'GROUP_SHEET_ALREADY_EXISTS',
        'Group sheet "' + sheetName + '" already exists'
      );
    }

    const groupSheet = spreadsheet.insertSheet(sheetName);

    try {
      this.initializeGroupSheet(groupSheet);
      this.getGroupsSheet().appendRow(this.groupToRow(group));
    } catch (error) {
      spreadsheet.deleteSheet(groupSheet);
      throw error;
    }

    return {
      group: group
    };
  },


  getGroupsSheet: function() {

    const spreadsheet = SheetsRepository.getSpreadsheet();
    let sheet = spreadsheet.getSheetByName(this.GROUPS_SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(this.GROUPS_SHEET_NAME);
    }

    this.ensureHeaders(sheet);
    return sheet;
  },


  ensureHeaders: function(sheet) {

    const range = sheet.getRange(1, 1, 1, this.HEADERS.length);
    const current = range.getValues()[0];
    let needsUpdate = false;

    for (let i = 0; i < this.HEADERS.length; i++) {
      if (current[i] !== this.HEADERS[i]) {
        needsUpdate = true;
        break;
      }
    }

    if (needsUpdate) {
      range.setValues([this.HEADERS]);
      sheet.setFrozenRows(1);
    }
  },


  getAllGroups: function() {

    const sheet = this.getGroupsSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return [];
    }

    return sheet
      .getRange(2, 1, lastRow - 1, this.HEADERS.length)
      .getValues()
      .map(this.rowToGroup);
  },


  findByName: function(name) {

    const groups = this.getAllGroups();
    const normalizedName = name.toLowerCase();

    for (let i = 0; i < groups.length; i++) {
      if (groups[i].Name.toLowerCase() === normalizedName) {
        return {
          row: i + 2,
          group: groups[i]
        };
      }
    }

    return null;
  },


  findByGroupId: function(groupId) {

    const groups = this.getAllGroups();

    for (let i = 0; i < groups.length; i++) {
      if (String(groups[i].GroupId) === String(groupId)) {
        return {
          row: i + 2,
          group: groups[i]
        };
      }
    }

    return null;
  },


  updateGroupRow: function(row, group) {

    this.getGroupsSheet()
      .getRange(row, 1, 1, this.HEADERS.length)
      .setValues([this.groupToRow(group)]);
  },


  rowToGroup: function(row) {

    return {
      GroupId: row[0],
      Name: row[1],
      CreatedAt: Utils.normalizeValue(row[2]),
      UpdatedAt: Utils.normalizeValue(row[3]),
      Status: row[4]
    };
  },


  groupToRow: function(group) {

    return [
      group.GroupId,
      group.Name,
      group.CreatedAt,
      group.UpdatedAt,
      group.Status
    ];
  },


  getGroupSheetName: function(groupId) {
    return 'group_' + groupId;
  },


  validateName: function(name) {

    if (typeof name !== 'string' || !name.trim()) {
      throw Utils.error(
        'INVALID_GROUP_NAME',
        'Group name is required'
      );
    }

    return name.trim();
  },


  validateGroupId: function(groupId) {

    if (typeof groupId !== 'string' || !groupId.trim()) {
      throw Utils.error(
        'INVALID_GROUP_ID',
        'Group ID is required'
      );
    }

    return groupId.trim();
  }
};
