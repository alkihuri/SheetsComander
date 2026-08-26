const CONFIG = {
  VERSION: 'v1',

  PROPERTY_SPREADSHEET_ID: 'SPREADSHEET_ID',
  PROPERTY_API_KEY: 'API_KEY',
  PROPERTY_ENVIRONMENT: 'ENVIRONMENT',

  MAX_REQUEST_SIZE: 500000
};


function getConfig() {

  const properties =
    PropertiesService.getScriptProperties();

  const spreadsheetId =
    properties.getProperty(
      CONFIG.PROPERTY_SPREADSHEET_ID
    );

  const apiKey =
    properties.getProperty(
      CONFIG.PROPERTY_API_KEY
    );

  const environment =
    properties.getProperty(
      CONFIG.PROPERTY_ENVIRONMENT
    ) || 'development';

  return {
    spreadsheetId: spreadsheetId,
    apiKey: apiKey,
    environment: environment
  };
}

function debugConfig() {

  const config = getConfig();

  console.log(
    JSON.stringify(config, null, 2)
  );

  if (!config.spreadsheetId) {
    throw new Error(
      'SPREADSHEET_ID is still missing from getConfig()'
    );
  }

  console.log(
    'Spreadsheet ID is OK'
  );
}