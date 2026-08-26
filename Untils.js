const Utils = {

  generateId: function() {
    return Utilities.getUuid();
  },


  now: function() {
    return new Date().toISOString();
  },


  error: function(code, message) {

    const error = new Error(message);
    error.code = code;

    return error;
  },


  isObject: function(value) {
    return value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value);
  },


  normalizeValue: function(value) {

    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  },


  normalizeRow: function(row) {

    return row.map(function(value) {
      return Utils.normalizeValue(value);
    });
  },


  normalizeMatrix: function(matrix) {

    return matrix.map(function(row) {
      return Utils.normalizeRow(row);
    });
  }
};