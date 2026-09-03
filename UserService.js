const UsersService = {

  createUser: function(payload) {

    Validation.require(
      payload.pilgrimNumber,
      'INVALID_PAYLOAD',
      'Pilgrim number is required'
    );


    Validation.require(
      payload.fullName,
      'INVALID_PAYLOAD',
      'Full name is required'
    );


    Validation.require(
      payload.groupId,
      'INVALID_PAYLOAD',
      'Group ID is required'
    );


    // 2. LevelResults - парсим JSON
    let levelResults = parseLevelResults(payload.LevelResults);
     



    /*
     * Check duplicate pilgrim number.
     */

    const existing =
      UsersRepository.findByPilgrimNumber(
        payload.pilgrimNumber
      );


    if (existing) {

      throw Utils.error(
        'USER_ALREADY_EXISTS',
        'User with this pilgrim number already exists'
      );
    }


    const now =
      Utils.now();


    const user = {

      UserId:
        Utils.generateId(),

      PilgrimNumber:
        String(payload.pilgrimNumber),

      FullName:
        String(payload.fullName),

      GroupId:
        String(payload.groupId),
        

      CreatedAt:
        now,

      UpdatedAt:
        now,

      Status:
        'active',

      LevelResults:
        levelResults
    };


    return UsersRepository.create(
      user
    );
  },


 

  getUser: function(payload) {

    Validation.require(
      payload.userId,
      'INVALID_PAYLOAD',
      'User ID is required'
    );


    const result =
      UsersRepository.findByUserId(
        payload.userId
      );


    if (!result) {

      throw Utils.error(
        'USER_NOT_FOUND',
        'User was not found'
      );
    }


    return result;
  },


  findUser: function(payload) {

    Validation.require(
      payload.pilgrimNumber,
      'INVALID_PAYLOAD',
      'Pilgrim number is required'
    );


    const result =
      UsersRepository.findByPilgrimNumber(
        payload.pilgrimNumber
      );


    if (!result) {

      return {
        found: false,
        row: null,
        user: null
      };
    }


    return {
      found: true,
      row: result.row,
      user: result.user
    };
  },


  updateUser: function(payload) {

    Validation.require(
      payload.userId,
      'INVALID_PAYLOAD',
      'User ID is required'
    );


    const result =
      UsersRepository.findByUserId(
        payload.userId
      );


    if (!result) {

      throw Utils.error(
        'USER_NOT_FOUND',
        'User was not found'
      );
    }


    const user =
      result.user;


    /*
     * Update only provided fields.
     */

    if (
      payload.pilgrimNumber !== undefined
    ) {

      user.PilgrimNumber =
        String(
          payload.pilgrimNumber
        );
    }


    if (
      payload.fullName !== undefined
    ) {

      user.FullName =
        String(
          payload.fullName
        );
    }


    if (
      payload.groupId !== undefined
    ) {

      user.GroupId =
        String(
          payload.groupId
        );
    }


    if (
      payload.status !== undefined
    ) {

      user.Status =
        String(
          payload.status
        );
    }

    if(
      payload.LevelResults
    )
    {
      user.LevelResults = String(payload.LevelResults)
    }


    user.UpdatedAt =
      Utils.now();


    return UsersRepository.update(
      result.row,
      user
    );
  },


  deleteUser: function(payload) {

    Validation.require(
      payload.userId,
      'INVALID_PAYLOAD',
      'User ID is required'
    );


    const result =
      UsersRepository.findByUserId(
        payload.userId
      );


    if (!result) {

      throw Utils.error(
        'USER_NOT_FOUND',
        'User was not found'
      );
    }


    return UsersRepository.delete(
      result.row
    );
  }
};





function parseLevelResults(levelResultsInput) {
    // Если уже объект и не пустой - возвращаем как есть
    if (typeof levelResultsInput === 'object' && levelResultsInput !== null && Object.keys(levelResultsInput).length > 0) {
        Logger.log('LevelResults уже объект:', Object.keys(levelResultsInput));
        return levelResultsInput;
    }
    
    // Если нет данных - возвращаем пустой объект
    if (!levelResultsInput) {
        Logger.log('LevelResults отсутствует');
        return {};
    }
    
    let str = String(levelResultsInput);
    Logger.log('Исходная строка LevelResults (первые 200 символов):', str.substring(0, 200));
    
    // Шаг 1: Пытаемся декодировать URL-кодирование
    if (str.includes('%')) {
        try {
            str = decodeURIComponent(str);
            Logger.log('После decodeURIComponent (первые 200 символов):', str.substring(0, 200));
        } catch (e) {
            Logger.log('Ошибка при decodeURIComponent:', e.message);
        }
    }
    
    // Шаг 2: Удаляем лишние пробелы
    str = str.trim();
    
    // Шаг 3: Проверяем, что это похоже на JSON
    if (!str.startsWith('{') || !str.endsWith('}')) {
        Logger.log('Строка не похожа на JSON (не начинается/заканчивается на {})');
        
        // Пробуем найти JSON внутри строки
        const jsonMatch = str.match(/\{.*\}/);
        if (jsonMatch) {
            str = jsonMatch[0];
            Logger.log('Найден JSON внутри строки:', str.substring(0, 200));
        } else {
            Logger.log('JSON не найден в строке');
            return {};
        }
    }
    
    // Шаг 4: Парсим JSON
    try {
        const result = JSON.parse(str);
        Logger.log('✅ LevelResults успешно распарсен. Ключи:', Object.keys(result));
        Logger.log('Количество уровней:', Object.keys(result).length);
        return result;
    } catch (e) {
        Logger.log('❌ Ошибка парсинга JSON:', e.message);
        Logger.log('Строка для парсинга:', str);
        
        // Шаг 5: Пробуем исправить распространенные проблемы
        try {
            // Заменяем одинарные кавычки на двойные
            const fixed = str.replace(/'/g, '"');
            const result = JSON.parse(fixed);
            Logger.log('✅ Удалось распарсить после замены кавычек');
            return result;
        } catch (e2) {
            Logger.log('❌ Вторая попытка тоже не удалась:', e2.message);
            return {};
        }
    }
} 
function formatProgressSimple(levelResults) {
    if (!levelResults) return '';
    if (typeof levelResults !== 'object') return '';
    
    const keys = Object.keys(levelResults);
    if (keys.length === 0) return '';
    
    // Сортируем
    keys.sort((a, b) => {
        return parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]);
    });
    
    // Собираем строку
    let result = '';
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const score = levelResults[key].ScorePercent || 0;
        if (i > 0) result += ', ';
        result += key + ':' + score;
    }
    
    return result;
}