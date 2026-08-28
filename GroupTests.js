/**
 * Runs the group lifecycle against TEST_SPREADSHEET_ID and removes its test
 * group and group sheet when complete.
 */
function runGroupTest() {

  const properties = PropertiesService.getScriptProperties();
  const originalSpreadsheetId = properties.getProperty(CONFIG.PROPERTY_SPREADSHEET_ID);
  const testSpreadsheetId = properties.getProperty(TEST_CONFIG.PROPERTY_TEST_SPREADSHEET_ID);

  if (!testSpreadsheetId) {
    throw new Error('TEST_SPREADSHEET_ID is required for runGroupTest');
  }

  const name = 'TEST_GROUP_' + new Date().getTime();
  let group;

  properties.setProperty(CONFIG.PROPERTY_SPREADSHEET_ID, testSpreadsheetId);

  try {
    const created = GroupService.createGroup({ name: name });
    group = created.group;

    assertTrue(!!group.GroupId, 'Create must return a GroupId');
    assertEqual(group.Name, name, 'Create must preserve the group name');

    const found = GroupService.findGroup({ name: name });
    assertTrue(found.found, 'Find must locate the created group');
    assertEqual(found.group.GroupId, group.GroupId, 'Find must return the created group');

    const fetched = GroupService.getGroup({ groupId: group.GroupId });
    assertTrue(fetched.sheet.exists, 'Group sheet must exist');

    const ensured = GroupService.ensureGroup({ name: name });
    assertEqual(ensured.group.GroupId, group.GroupId, 'Ensure must be idempotent');

    const matchingGroups = GroupService.listGroups().groups.filter(function(item) {
      return item.GroupId === group.GroupId;
    });
    assertEqual(matchingGroups.length, 1, 'Ensure must not create a duplicate group');

    const sheet = SheetsRepository.getSheet(fetched.sheet.name);
    const expectedHeaders = ['UserId', 'FullName'];
    for (let level = 0; level < GROUP_CONFIG.LEVEL_COUNT; level++) {
      expectedHeaders.push('Level ' + level);
    }
    assertEqual(
      JSON.stringify(sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0]),
      JSON.stringify(expectedHeaders),
      'Group sheet headers must match the configured levels'
    );

    const updatedName = name + '_UPDATED';
    const updated = GroupService.updateGroup({
      groupId: group.GroupId,
      name: updatedName,
      status: 'active'
    });
    assertEqual(updated.group.Name, updatedName, 'Update must change the name');

    const deactivated = GroupService.deleteGroup({ groupId: group.GroupId });
    assertEqual(deactivated.group.Status, 'inactive', 'Delete must deactivate the group');

    const inactive = GroupService.getGroup({ groupId: group.GroupId });
    assertEqual(inactive.group.Status, 'inactive', 'Deactivated group must remain available');

    return {
      passed: true,
      groupId: group.GroupId
    };

  } finally {
    if (group) {
      const spreadsheet = SheetsRepository.getSpreadsheet();
      const groupSheet = spreadsheet.getSheetByName(
        GroupService.getGroupSheetName(group.GroupId)
      );

      if (groupSheet && spreadsheet.getSheets().length > 1) {
        spreadsheet.deleteSheet(groupSheet);
      }

      const result = GroupService.findByGroupId(group.GroupId);
      if (result) {
        GroupService.getGroupsSheet().deleteRow(result.row);
      }
    }

    if (originalSpreadsheetId) {
      properties.setProperty(CONFIG.PROPERTY_SPREADSHEET_ID, originalSpreadsheetId);
    } else {
      properties.deleteProperty(CONFIG.PROPERTY_SPREADSHEET_ID);
    }
  }
}
