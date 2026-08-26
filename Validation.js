const Validation = {

  validateRequest: function(request) {

    if (!request || typeof request !== 'object') {
      throw Utils.error(
        'INVALID_REQUEST',
        'Request must be an object'
      );
    }

    if (!request.action) {
      throw Utils.error(
        'INVALID_ACTION',
        'Action is required'
      );
    }

    if (!request.payload) {
      request.payload = {};
    }
  },


  validateApiKey: function(request) {

    const config = getConfig();

    // API key можно отключить в development.
    if (!config.apiKey) {
      return;
    }

    if (request.apiKey !== config.apiKey) {
      throw Utils.error(
        'UNAUTHORIZED',
        'Invalid API key'
      );
    }
  },


  require: function(condition, code, message) {

    if (!condition) {
      throw Utils.error(code, message);
    }
  },


  requireSheetName: function(payload) {

    this.require(
      payload.sheet,
      'INVALID_PAYLOAD',
      'Sheet name is required'
    );
  },


  requireRange: function(payload) {

    this.require(
      payload.range,
      'INVALID_RANGE',
      'Range is required'
    );
  }
};