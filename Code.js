function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}





function doGet(e) {
const requestId = Utils.generateId();

try {
const params = e && e.parameter ? e.parameter : {};
 console.log(params);
if (!params.action) {
  console.log("Get req without action");
  return Response.success({
    service: 'GoogleSheetsAPI',
    version: CONFIG.VERSION,
    status: 'online'
  });
}

// Создаём тот же request, который раньше приходил через POST
const request = {
  action: params.action,
  requestId: params.requestId || requestId,
  apiKey: params.apiKey,

  // Все параметры кроме служебных автоматически кладём в payload
  payload: {}
};

const reservedParams = [
  'action',
  'requestId',
  'apiKey'
];

Object.keys(params).forEach(key => {
  if (!reservedParams.includes(key)) {
    request.payload[key] = params[key];
  }
});

//Validation.validateRequest(request);
//Validation.validateApiKey(request);


  console.log("REQUEST ID:", request.requestId);
 console.log("REQUEST:", JSON.stringify(request));

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
function debugProperties() {
  const properties = PropertiesService.getScriptProperties();
  const all = properties.getProperties();

  console.log(JSON.stringify(all, null, 2));
}

function doPost(e) {
  const requestId = Utils.generateId();
 
 if (e.method === "OPTIONS") 
 {
  return doOptions(); 
 }
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

    console.log(request);

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