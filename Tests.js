/**
 * ============================================================
 * GOOGLE SHEETS API — TEST SUITE
 * ============================================================
 *
 * Required Script Properties:
 *
 * SPREADSHEET_ID
 * TEST_SPREADSHEET_ID
 * API_KEY
 * ENVIRONMENT
 *
 * Run:
 *
 *   runAllTests()
 *
 * Tests use TEST_SPREADSHEET_ID.
 * Production API uses SPREADSHEET_ID.
 *
 * ============================================================
 */


/**
 * Test configuration
 */
const TEST_CONFIG = {
  PROPERTY_TEST_SPREADSHEET_ID: 'TEST_SPREADSHEET_ID',

  TEST_SHEET: '__API_TEST__',

  DELETE_TEST_SHEET: '__DELETE_TEST__',

  RENAMED_TEST_SHEET: '__API_TEST_RENAMED__'
};


/**
 * ============================================================
 * TEST ENTRY POINT
 * ============================================================
 */

function runAllTests() {

  const results = [];
  const startedAt = new Date();

  console.log('====================================');
  console.log('GOOGLE SHEETS API TEST SUITE');
  console.log('====================================');


  /*
   * Basic utilities
   */

  testUtils(results);


  /*
   * Configuration
   */

  testConfiguration(results);


  /*
   * Test spreadsheet connection
   */

  testTestSpreadsheetConnection(results);


  /*
   * Prepare test environment
   */

  testPrepareTestSheet(results);


  /*
   * Sheet operations
   */

  testGetSheet(results);

  testListSheets(results);


  /*
   * Cell operations
   */

  testSetCell(results);

  testGetCell(results);


  /*
   * Range operations
   */

  testSetRange(results);

  testGetRange(results);


  /*
   * Row operations
   */

  testAppendRow(results);

  testUpdateRow(results);


  /*
   * Sheet management
   */

  testCreateSheet(results);

  testRenameSheet(results);

  testDeleteSheet(results);


  /*
   * Validation
   */

  testValidation(results);


  /*
   * Router
   */

  testRouterHealth(results);

  testRouterInvalidAction(results);

  testRouterMissingAction(results);


  /*
   * Summary
   */

  const duration =
    new Date().getTime() -
    startedAt.getTime();

  const passed =
    results.filter(function(result) {
      return result.status === 'PASS';
    }).length;

  const failed =
    results.filter(function(result) {
      return result.status === 'FAIL';
    }).length;


  console.log('====================================');
  console.log('TEST RESULTS');
  console.log('====================================');

  console.log(
    'Passed: ' +
    passed
  );

  console.log(
    'Failed: ' +
    failed
  );

  console.log(
    'Total: ' +
    results.length
  );

  console.log(
    'Duration: ' +
    duration +
    'ms'
  );

  console.log('====================================');


  results.forEach(function(result) {

    console.log(
      '[' +
      result.status +
      '] ' +
      result.test +
      ' - ' +
      result.message
    );

  });


  if (failed > 0) {

    throw new Error(
      'Tests failed: ' +
      failed +
      ' / ' +
      results.length
    );
  }


  console.log(
    'ALL TESTS PASSED'
  );


  return results;
}


/**
 * ============================================================
 * ASSERTIONS
 * ============================================================
 */

function assertTrue(condition, message) {

  if (!condition) {

    throw new Error(
      message ||
      'Expected condition to be true'
    );
  }
}


function assertFalse(condition, message) {

  if (condition) {

    throw new Error(
      message ||
      'Expected condition to be false'
    );
  }
}


function assertEqual(actual, expected, message) {

  if (actual !== expected) {

    throw new Error(
      (message || 'Values are not equal') +
      '\nExpected: ' +
      expected +
      '\nActual: ' +
      actual
    );
  }
}


function assertNotNull(value, message) {

  if (
    value === null ||
    value === undefined
  ) {

    throw new Error(
      message ||
      'Expected value to be non-null'
    );
  }
}


function assertArray(value, message) {

  if (!Array.isArray(value)) {

    throw new Error(
      message ||
      'Expected value to be an array'
    );
  }
}


function assertThrows(callback, expectedCode) {

  let thrown = false;

  try {

    callback();

  } catch (error) {

    thrown = true;

    if (expectedCode) {

      assertEqual(
        error.code,
        expectedCode,
        'Unexpected error code'
      );
    }
  }


  assertTrue(
    thrown,
    'Expected function to throw'
  );
}


/**
 * ============================================================
 * TEST RUNNER
 * ============================================================
 */

function runTest(results, name, callback) {

  try {

    callback();


    results.push({
      test: name,
      status: 'PASS',
      message: 'OK'
    });


  } catch (error) {

    results.push({
      test: name,
      status: 'FAIL',
      message:
        error.message ||
        String(error)
    });


    console.error(
      '[FAIL] ' +
      name +
      ': ' +
      (
        error.message ||
        String(error)
      )
    );
  }
}


/**
 * ============================================================
 * TEST SPREADSHEET
 * ============================================================
 */


/**
 * Returns TEST_SPREADSHEET_ID.
 *
 * IMPORTANT:
 * This function NEVER uses SPREADSHEET_ID.
 */
function getTestSpreadsheetId() {

  const properties =
    PropertiesService
      .getScriptProperties();


  const id =
    properties.getProperty(
      TEST_CONFIG.PROPERTY_TEST_SPREADSHEET_ID
    );


  if (!id) {

    throw new Error(
      'TEST_SPREADSHEET_ID is not configured'
    );
  }


  return id;
}


/**
 * Opens test spreadsheet.
 */
function getTestSpreadsheet() {

  const id =
    getTestSpreadsheetId();


  return SpreadsheetApp.openById(id);
}


/**
 * Prepares the main test sheet.
 */
function prepareTestSheet() {

  const spreadsheet =
    getTestSpreadsheet();


  let sheet =
    spreadsheet.getSheetByName(
      TEST_CONFIG.TEST_SHEET
    );


  if (!sheet) {

    sheet =
      spreadsheet.insertSheet(
        TEST_CONFIG.TEST_SHEET
      );
  }


  /*
   * Clear previous test data.
   */

  sheet.clear();


  /*
   * Remove any old test data
   * outside the normal range if needed.
   */

  return sheet;
}


/**
 * ============================================================
 * UTIL TESTS
 * ============================================================
 */

function testUtils(results) {


  runTest(
    results,
    'Utils.generateId',
    function() {

      const id =
        Utils.generateId();


      assertNotNull(
        id,
        'Generated ID is null'
      );


      assertTrue(
        typeof id === 'string',
        'Generated ID must be a string'
      );


      assertTrue(
        id.length > 10,
        'Generated ID is too short'
      );
    }
  );


  runTest(
    results,
    'Utils.now',
    function() {

      const value =
        Utils.now();


      assertTrue(
        typeof value === 'string',
        'Date must be string'
      );


      assertTrue(
        !isNaN(Date.parse(value)),
        'Invalid ISO date'
      );
    }
  );


  runTest(
    results,
    'Utils.normalizeMatrix',
    function() {

      const input = [
        ['A', 'B'],
        ['C', 'D']
      ];


      const result =
        Utils.normalizeMatrix(
          input
        );


      assertArray(
        result
      );


      assertEqual(
        result.length,
        2
      );


      assertEqual(
        result[0][0],
        'A'
      );


      assertEqual(
        result[1][1],
        'D'
      );
    }
  );
}


/**
 * ============================================================
 * CONFIGURATION TEST
 * ============================================================
 */

function testConfiguration(results) {

  runTest(
    results,
    'Configuration',
    function() {

      const config =
        getConfig();


      assertNotNull(
        config,
        'Config is null'
      );


      assertNotNull(
        config.spreadsheetId,
        'SPREADSHEET_ID is missing'
      );


      assertNotNull(
        config.environment,
        'ENVIRONMENT is missing'
      );


      assertTrue(
        typeof config.environment === 'string',
        'Environment must be string'
      );
    }
  );
}


/**
 * ============================================================
 * TEST SPREADSHEET CONNECTION
 * ============================================================
 */

function testTestSpreadsheetConnection(results) {

  runTest(
    results,
    'Test spreadsheet connection',
    function() {

      const id =
        getTestSpreadsheetId();


      assertNotNull(
        id,
        'TEST_SPREADSHEET_ID is missing'
      );


      const spreadsheet =
        getTestSpreadsheet();


      assertNotNull(
        spreadsheet,
        'Spreadsheet is null'
      );


      assertEqual(
        spreadsheet.getId(),
        id,
        'Opened wrong spreadsheet'
      );


      assertTrue(
        spreadsheet.getName().length > 0,
        'Spreadsheet has no name'
      );
    }
  );
}


/**
 * ============================================================
 * PREPARE TEST SHEET
 * ============================================================
 */

function testPrepareTestSheet(results) {

  runTest(
    results,
    'Prepare test sheet',
    function() {

      const sheet =
        prepareTestSheet();


      assertNotNull(
        sheet
      );


      assertEqual(
        sheet.getName(),
        TEST_CONFIG.TEST_SHEET
      );
    }
  );
}


/**
 * ============================================================
 * GET SHEET
 * ============================================================
 */

function testGetSheet(results) {

  runTest(
    results,
    'getSheet',
    function() {

      const sheet =
        SheetsRepository.getSheet(
          TEST_CONFIG.TEST_SHEET
        );


      assertNotNull(
        sheet
      );


      assertEqual(
        sheet.getName(),
        TEST_CONFIG.TEST_SHEET
      );
    }
  );
}


/**
 * ============================================================
 * LIST SHEETS
 * ============================================================
 */

function testListSheets(results) {

  runTest(
    results,
    'listSheets',
    function() {

      const sheets =
        SheetsRepository.listSheets();


      assertArray(
        sheets
      );


      const exists =
        sheets.some(function(sheet) {

          return (
            sheet.name ===
            TEST_CONFIG.TEST_SHEET
          );

        });


      assertTrue(
        exists,
        'Test sheet should exist'
      );
    }
  );
}


/**
 * ============================================================
 * SET CELL
 * ============================================================
 */

function testSetCell(results) {

  runTest(
    results,
    'setCell',
    function() {

      prepareTestSheet();


      const result =
        SheetsRepository.setCell(
          TEST_CONFIG.TEST_SHEET,
          'A1',
          'Hello'
        );


      assertEqual(
        result.sheet,
        TEST_CONFIG.TEST_SHEET
      );


      assertEqual(
        result.cell,
        'A1'
      );


      assertEqual(
        result.value,
        'Hello'
      );


      const spreadsheet =
        getTestSpreadsheet();


      const sheet =
        spreadsheet.getSheetByName(
          TEST_CONFIG.TEST_SHEET
        );


      assertEqual(
        sheet
          .getRange('A1')
          .getValue(),
        'Hello'
      );
    }
  );
}


/**
 * ============================================================
 * GET CELL
 * ============================================================
 */

function testGetCell(results) {

  runTest(
    results,
    'getCell',
    function() {

      const result =
        SheetsRepository.getCell(
          TEST_CONFIG.TEST_SHEET,
          'A1'
        );


      assertEqual(
        result.value,
        'Hello'
      );
    }
  );
}


/**
 * ============================================================
 * SET RANGE
 * ============================================================
 */

function testSetRange(results) {

  runTest(
    results,
    'setRange',
    function() {

      const values = [
        [
          'Name',
          'Group',
          'Score'
        ],
        [
          'Ahmed',
          'A',
          100
        ],
        [
          'Ali',
          'B',
          80
        ]
      ];


      const result =
        SheetsRepository.setRange(
          TEST_CONFIG.TEST_SHEET,
          'A1:C3',
          values
        );


      assertEqual(
        result.sheet,
        TEST_CONFIG.TEST_SHEET
      );


      assertEqual(
        result.range,
        'A1:C3'
      );


      assertEqual(
        result.values.length,
        3
      );


      const spreadsheet =
        getTestSpreadsheet();


      const sheet =
        spreadsheet.getSheetByName(
          TEST_CONFIG.TEST_SHEET
        );


      assertEqual(
        sheet
          .getRange('A2')
          .getValue(),
        'Ahmed'
      );


      assertEqual(
        sheet
          .getRange('C3')
          .getValue(),
        80
      );
    }
  );
}


/**
 * ============================================================
 * GET RANGE
 * ============================================================
 */

function testGetRange(results) {

  runTest(
    results,
    'getRange',
    function() {

      const result =
        SheetsRepository.getRange(
          TEST_CONFIG.TEST_SHEET,
          'A1:C3'
        );


      assertEqual(
        result.sheet,
        TEST_CONFIG.TEST_SHEET
      );


      assertEqual(
        result.range,
        'A1:C3'
      );


      assertArray(
        result.values
      );


      assertEqual(
        result.values.length,
        3
      );


      assertEqual(
        result.values[0][0],
        'Name'
      );


      assertEqual(
        result.values[1][0],
        'Ahmed'
      );


      assertEqual(
        result.values[2][2],
        80
      );
    }
  );
}


/**
 * ============================================================
 * APPEND ROW
 * ============================================================
 */

function testAppendRow(results) {

  runTest(
    results,
    'appendRow',
    function() {

      const values = [
        'Omar',
        'C',
        90
      ];


      const result =
        SheetsRepository.appendRow(
          TEST_CONFIG.TEST_SHEET,
          values
        );


      assertEqual(
        result.sheet,
        TEST_CONFIG.TEST_SHEET
      );


      assertTrue(
        result.row > 0,
        'Row must be positive'
      );


      assertEqual(
        result.values[0],
        'Omar'
      );


      const spreadsheet =
        getTestSpreadsheet();


      const sheet =
        spreadsheet.getSheetByName(
          TEST_CONFIG.TEST_SHEET
        );


      assertEqual(
        sheet
          .getRange(result.row, 1)
          .getValue(),
        'Omar'
      );
    }
  );
}


/**
 * ============================================================
 * UPDATE ROW
 * ============================================================
 */

function testUpdateRow(results) {

  runTest(
    results,
    'updateRow',
    function() {

      const values = [
        'Ahmed Updated',
        'A+',
        110
      ];


      const result =
        SheetsRepository.updateRow(
          TEST_CONFIG.TEST_SHEET,
          2,
          values
        );


      assertEqual(
        result.sheet,
        TEST_CONFIG.TEST_SHEET
      );


      assertEqual(
        result.row,
        2
      );


      const spreadsheet =
        getTestSpreadsheet();


      const sheet =
        spreadsheet.getSheetByName(
          TEST_CONFIG.TEST_SHEET
        );


      assertEqual(
        sheet
          .getRange('A2')
          .getValue(),
        'Ahmed Updated'
      );


      assertEqual(
        sheet
          .getRange('B2')
          .getValue(),
        'A+'
      );


      assertEqual(
        sheet
          .getRange('C2')
          .getValue(),
        110
      );
    }
  );
}


/**
 * ============================================================
 * CREATE SHEET
 * ============================================================
 */

function testCreateSheet(results) {

  runTest(
    results,
    'createSheet',
    function() {

      const spreadsheet =
        getTestSpreadsheet();


      /*
       * Remove previous sheet if
       * it exists from a previous run.
       */

      const existing =
        spreadsheet.getSheetByName(
          TEST_CONFIG.DELETE_TEST_SHEET
        );


      if (existing) {

        spreadsheet.deleteSheet(
          existing
        );
      }


      const result =
        SheetsRepository.createSheet(
          TEST_CONFIG.DELETE_TEST_SHEET
        );


      assertNotNull(
        result
      );


      assertEqual(
        result.name,
        TEST_CONFIG.DELETE_TEST_SHEET
      );


      assertTrue(
        result.id > 0,
        'Sheet ID must be positive'
      );


      assertNotNull(
        spreadsheet.getSheetByName(
          TEST_CONFIG.DELETE_TEST_SHEET
        )
      );
    }
  );
}


/**
 * ============================================================
 * RENAME SHEET
 * ============================================================
 */

function testRenameSheet(results) {

  runTest(
    results,
    'renameSheet',
    function() {

      const spreadsheet =
        getTestSpreadsheet();


      /*
       * Clean previous renamed sheet.
       */

      const renamedExisting =
        spreadsheet.getSheetByName(
          TEST_CONFIG.RENAMED_TEST_SHEET
        );


      if (renamedExisting) {

        spreadsheet.deleteSheet(
          renamedExisting
        );
      }


      /*
       * Make sure original exists.
       */

      let original =
        spreadsheet.getSheetByName(
          TEST_CONFIG.DELETE_TEST_SHEET
        );


      if (!original) {

        original =
          spreadsheet.insertSheet(
            TEST_CONFIG.DELETE_TEST_SHEET
          );
      }


      const result =
        SheetsRepository.renameSheet(
          TEST_CONFIG.DELETE_TEST_SHEET,
          TEST_CONFIG.RENAMED_TEST_SHEET
        );


      assertEqual(
        result.oldName,
        TEST_CONFIG.DELETE_TEST_SHEET
      );


      assertEqual(
        result.newName,
        TEST_CONFIG.RENAMED_TEST_SHEET
      );


      assertNotNull(
        spreadsheet.getSheetByName(
          TEST_CONFIG.RENAMED_TEST_SHEET
        )
      );
    }
  );
}


/**
 * ============================================================
 * DELETE SHEET
 * ============================================================
 */

function testDeleteSheet(results) {

  runTest(
    results,
    'deleteSheet',
    function() {

      const spreadsheet =
        getTestSpreadsheet();


      /*
       * We should now have the renamed
       * test sheet.
       */

      const sheet =
        spreadsheet.getSheetByName(
          TEST_CONFIG.RENAMED_TEST_SHEET
        );


      assertNotNull(
        sheet,
        'Renamed test sheet does not exist'
      );


      const result =
        SheetsRepository.deleteSheet(
          TEST_CONFIG.RENAMED_TEST_SHEET
        );


      assertTrue(
        result.deleted,
        'Sheet should be deleted'
      );


      assertEqual(
        spreadsheet.getSheetByName(
          TEST_CONFIG.RENAMED_TEST_SHEET
        ),
        null
      );
    }
  );
}


/**
 * ============================================================
 * VALIDATION TESTS
 * ============================================================
 */

function testValidation(results) {


  runTest(
    results,
    'Validation missing action',
    function() {

      assertThrows(
        function() {

          Validation.validateRequest({
            payload: {}
          });

        },
        'INVALID_ACTION'
      );
    }
  );


  runTest(
    results,
    'Validation invalid API key',
    function() {

      /*
       * If API_KEY is configured,
       * invalid key must fail.
       */

      const config =
        getConfig();


      if (!config.apiKey) {
        return;
      }


      assertThrows(
        function() {

          Validation.validateApiKey({
            apiKey:
              '__INVALID_API_KEY__'
          });

        },
        'UNAUTHORIZED'
      );
    }
  );


  runTest(
    results,
    'Validation missing sheet',
    function() {

      assertThrows(
        function() {

          Validation.requireSheetName({});

        },
        'INVALID_PAYLOAD'
      );
    }
  );


  runTest(
    results,
    'Validation missing range',
    function() {

      assertThrows(
        function() {

          Validation.requireRange({
            sheet: 'Test'
          });

        },
        'INVALID_RANGE'
      );
    }
  );
}


/**
 * ============================================================
 * ROUTER — HEALTH
 * ============================================================
 */

function testRouterHealth(results) {

  runTest(
    results,
    'Router health',
    function() {

      const request = {
        action: 'health',
        requestId:
          Utils.generateId()
      };


      const response =
        Router.handle(request);


      assertNotNull(
        response
      );


      const json =
        JSON.parse(
          response.getContent()
        );


      assertTrue(
        json.success,
        'Health request should succeed'
      );


      assertNotNull(
        json.data
      );


      assertEqual(
        json.data.status,
        'ok'
      );
    }
  );
}


/**
 * ============================================================
 * ROUTER — INVALID ACTION
 * ============================================================
 */

function testRouterInvalidAction(results) {

  runTest(
    results,
    'Router invalid action',
    function() {

      const request = {
        action:
          '__INVALID_ACTION__',

        requestId:
          Utils.generateId()
      };


      const response =
        Router.handle(request);


      const json =
        JSON.parse(
          response.getContent()
        );


      assertFalse(
        json.success
      );


      assertEqual(
        json.error.code,
        'INVALID_ACTION'
      );
    }
  );
}


/**
 * ============================================================
 * ROUTER — MISSING ACTION
 * ============================================================
 */

function testRouterMissingAction(results) {

  runTest(
    results,
    'Router missing action',
    function() {

      const request = {
        requestId:
          Utils.generateId(),

        payload: {}
      };


      /*
       * Router itself expects a valid
       * request, so validation is tested
       * separately here.
       */

      assertThrows(
        function() {

          Validation.validateRequest(
            request
          );

        },
        'INVALID_ACTION'
      );
    }
  );
}


/**
 * ============================================================
 * DEBUG FUNCTIONS
 * ============================================================
 */


/**
 * Prints test configuration.
 */
function debugTestConfiguration() {

  console.log(
    '===================================='
  );

  console.log(
    'TEST CONFIGURATION'
  );

  console.log(
    '===================================='
  );


  const properties =
    PropertiesService
      .getScriptProperties();


  console.log(
    'SPREADSHEET_ID: ' +
    properties.getProperty(
      'SPREADSHEET_ID'
    )
  );


  console.log(
    'TEST_SPREADSHEET_ID: ' +
    properties.getProperty(
      'TEST_SPREADSHEET_ID'
    )
  );


  console.log(
    'API_KEY: ' +
    properties.getProperty(
      'API_KEY'
    )
  );


  console.log(
    'ENVIRONMENT: ' +
    properties.getProperty(
      'ENVIRONMENT'
    )
  );


  const testId =
    getTestSpreadsheetId();


  const spreadsheet =
    getTestSpreadsheet();


  console.log(
    'TEST ID: ' +
    testId
  );


  console.log(
    'TEST SPREADSHEET NAME: ' +
    spreadsheet.getName()
  );


  console.log(
    'TEST SHEETS:'
  );


  spreadsheet
    .getSheets()
    .forEach(function(sheet) {

      console.log(
        '- ' +
        sheet.getName()
      );

    });


  console.log(
    '===================================='
  );
}


function testDoGet1() {
  const mockEvent = {
    parameter: {
      action: "createUser",
      fullName: "Test User",
      groupId: "Test Group",
      apiKey: "123",
      requestId: "test-request-123",
      pilgrimNumber : "123"
    }
  };

  const response = doGet(mockEvent);

  console.log(response.getContent());
}

function testDoGet2() {
  const mockEvent = {
    parameter: {
      action: "ensureGroup", 
      groupName: "123",
      apiKey: "123" 
    }
  };

  const response = doGet(mockEvent);

  console.log(response.getContent());
}