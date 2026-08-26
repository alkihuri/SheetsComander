const Response = {

  success: function(data, requestId) {

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: true,
          requestId: requestId || null,
          data: data === undefined ? null : data,
          error: null
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  },


  error: function(code, message, requestId, details) {

    return ContentService
      .createTextOutput(
        JSON.stringify({
          success: false,
          requestId: requestId || null,
          data: null,
          error: {
            code: code,
            message: message,
            details: details || null
          }
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
};