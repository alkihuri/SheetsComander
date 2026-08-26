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
        'active'
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