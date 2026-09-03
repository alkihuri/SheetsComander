function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}


 

function doGet(e) {
  const generatedRequestId = Utils.generateId();

  try {
    const params = e && e.parameter ? e.parameter : {};

    console.log("GET PARAMS:", JSON.stringify(params));

    if (!params.action) {
      console.log("GET request without action");

      return Response.success({
        service: 'GoogleSheetsAPI',
        version: CONFIG.VERSION,
        status: 'online'
      });
    }

    const request = {
      action: params.action,
      requestId: params.requestId || generatedRequestId,
      apiKey: params.apiKey,
      payload: {}
    };

    const reservedParams = [
      "action",
      "requestId",
      "apiKey"
    ];

    Object.keys(params).forEach(key => {

      // Не кладём служебные параметры в payload
      if (reservedParams.includes(key)) {
        return;
      }

      let value = params[key];

      // GET всегда передаёт параметры как строки.
      // Если Unity передал JSON-массив или объект —
      // восстанавливаем исходный тип.
      if (
        typeof value === "string" &&
        (
          value.startsWith("[") ||
          value.startsWith("{")
        )
      ) {
        try {
          value = JSON.parse(value);
        } catch (parseError) {
          console.log(
            `Could not parse "${key}" as JSON: ${parseError}`
          );
        }
      }

      request.payload[key] = value;
    });

    console.log("REQUEST ID:", request.requestId);
    console.log("REQUEST:", JSON.stringify(request));

    Validation.validateRequest(request);
    Validation.validateApiKey(request);

    return Router.handle(request);

  } catch (error) {

    console.error(error);

    return Response.error(
      error.code || "INTERNAL_ERROR",
      error.message || String(error),
      generatedRequestId
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