function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}





function doGet(e) {
  return Response.success({
    service: 'GoogleSheetsAPI',
    version: CONFIG.VERSION,
    status: 'online'
  });
}

function debugProperties() {
  const properties = PropertiesService.getScriptProperties();
  const all = properties.getProperties();

  console.log(JSON.stringify(all, null, 2));
}

function doPost(e) {
  const requestId = Utils.generateId();
 if (e.method === "OPTIONS") return doOptions();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return Response.error(
        'INVALID_REQUEST',
        'Request body is empty',
        requestId
      );
    }

    if (e.postData.contents.length > CONFIG.MAX_REQUEST_SIZE) {
      return Response.error(
        'REQUEST_TOO_LARGE',
        'Request body exceeds maximum allowed size',
        requestId
      );
    }

    const request = JSON.parse(e.postData.contents);

    request.requestId = request.requestId || requestId;

    Validation.validateRequest(request);

    Validation.validateApiKey(request);

    return Router.handle(request);

  } catch (error) {

    console.error(error);

    return Response.error(
      error.code || 'INTERNAL_ERROR',
      error.message || String(error),
      requestId
    );
  }
}