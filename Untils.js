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


/**
 * Получает процент прохождения для указанного уровня из JSON
 * 
 * @param {string} levelId - ID уровня (например "level_0", "level_1")
 * @param {string} jsonString - JSON строка с данными
 * @return {number} Процент прохождения
 */
function getScoreByLevel(levelId, jsonString) {
  try {
    
    // Проверяем, что пришло значение
    if (!jsonString) {
      return 0;
    }

    // Парсим JSON
    var data;

    if (typeof jsonString === 'object') {
      data = jsonString;
    } else {
      data = JSON.parse(jsonString);
    }

    // Ищем уровень
    for (var key in data) {

      var level = data[key];

      if (
        level &&
        String(level.LevelId) === String(levelId)
      ) {
        return Number(level.ScorePercent) || 0;
      }
    }

    return 0;

  } catch (error) {

    Logger.log(
      'Ошибка GET_PROGRESS: ' +
      error.message +
      '\nJSON: ' +
      jsonString
    );

    return 0;
  }
}


function GET_PROGRESS(levelId, text) {
  try {
    if (!text) {
      return 0;
    }

    // Приводим к строке
    text = String(text);

    // Ищем конкретный уровень
    // Например: level_3={ScorePercent=57.1, ...}
    var escapedLevelId = String(levelId)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    var regex = new RegExp(
      escapedLevelId +
      '=\\{([^}]*)\\}'
    );

    var match = text.match(regex);

    if (!match) {
      Logger.log('Уровень не найден: ' + levelId);
      return 0;
    }

    if(!match && text != null)
    {
      return 0;
    }

    var levelData = match[1];

    // Ищем ScorePercent
    var scoreMatch = levelData.match(
      /ScorePercent=([0-9.]+)/
    );

    if (!scoreMatch) {
      return 0;
    }

    return Number(scoreMatch[1]) || 0;

  } catch (error) {

    Logger.log(
      'Ошибка GET_PROGRESS: ' + error.message
    );

    return 0;
  }
}


function DoGetProgressTest()
{

  var cell = "{level_3={ScorePercent=57.1, CompletedAt=0001-01-01T00:00:00, LevelId=level_3}, level_1={LevelId=level_1, CompletedAt=0001-01-01T00:00:00, ScorePercent=14.3}, level_6={LevelId=level_6, ScorePercent=57.1, CompletedAt=0001-01-01T00:00:00}, level_0={CompletedAt=0001-01-01T00:00:00, ScorePercent=14.3, LevelId=level_0}, level_2={LevelId=level_2, ScorePercent=57.1, CompletedAt=0001-01-01T00:00:00}}";

  var level = "level_1";

  console.log(GET_PROGRESS(level,cell));
  
}

