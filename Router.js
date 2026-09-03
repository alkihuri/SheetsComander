const Router = {

  handle: function(request) {
 
    const action = request.action;
    const payload = request.payload || {};
    const requestId = request.requestId;

    try {

      let data;

      switch (action) {


        case 'createGroup':

          data =
            GroupService.createGroup(
              payload
            );

          break;


        case 'ensureGroup':

          data =
            GroupService.ensureGroup(
              payload
            );

          break;


        case 'findGroup':

          data =
            GroupService.findGroup(
              payload
            );

          break;


        case 'getGroup':

          data =
            GroupService.getGroup(
              payload
            );

          break;


        case 'listGroups':

          data =
            GroupService.listGroups();

          break;


        case 'updateGroup':

          data =
            GroupService.updateGroup(
              payload
            );

          break;


        case 'deleteGroup':

          data =
            GroupService.deleteGroup(
              payload
            );

          break;


        case 'createUser':

          data =
            UsersService.createUser(
              payload
            );

          break;


        case 'getUser':

          data =
            UsersService.getUser(
              payload
            );

          break;


        case 'findUser':

          data =
            UsersService.findUser(
              payload
            );

          break;


        case 'updateUser':

          data =
            UsersService.updateUser(
              payload
            );

          break;


        case 'deleteUser':

          data =
            UsersService.deleteUser(
              payload
            );

          break;


        case 'health':
          data = SheetService.health();
          break;

        case 'listSheets':
          data = SheetService.listSheets();
          break;

        case 'getSheet':
          data = SheetService.getSheet(payload);
          break;

        case 'getRange':
          data = SheetService.getRange(payload);
          break;

        case 'getCell':
          data = SheetService.getCell(payload);
          break;

        case 'setCell':
          data = SheetService.setCell(payload);
          break;

        case 'setRange':
          data = SheetService.setRange(payload);
          break;

        case 'appendRow':
          data = SheetService.appendRow(payload);
          break;

        case 'updateRow':
          data = SheetService.updateRow(payload);
          break;

        case 'createSheet':
          data = SheetService.createSheet(payload);
          break;

        case 'renameSheet':
          data = SheetService.renameSheet(payload);
          break;

        case 'deleteSheet':
          data = SheetService.deleteSheet(payload);
          break;

        default:
          return Response.error(
            'INVALID_ACTION',
            'Unknown action: ' + action,
            requestId
          );
      }

      return Response.success(
        data,
        requestId
      );

    } catch (error) {

      console.error(error);

      return Response.error(
        error.code || 'INTERNAL_ERROR',
        error.message || String(error),
        requestId
      );
    }
  }
};
